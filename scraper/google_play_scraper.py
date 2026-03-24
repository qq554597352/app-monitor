"""
Google Play 排行榜爬虫
使用 google-play-scraper 库获取真实数据（安装量、评分、评论数）
支持多国家 / 金融行业分类爬取
每个国家返回独立榜单
"""
import asyncio
import time
import random
from typing import List, Dict, Optional
from .parent_company_db import lookup_parent

# ───────────────────────────────────────────────
# 监控国家配置
# ───────────────────────────────────────────────
COUNTRIES = {
    "PH": {"name": "菲律宾",   "lang": "en", "gl": "PH"},
    "ID": {"name": "印尼",     "lang": "id", "gl": "ID"},
    "PK": {"name": "巴基斯坦", "lang": "en", "gl": "PK"},
    "MY": {"name": "马来西亚", "lang": "en", "gl": "MY"},
    "AU": {"name": "澳大利亚", "lang": "en", "gl": "AU"},
    "GB": {"name": "英国",     "lang": "en", "gl": "GB"},
    "MX": {"name": "墨西哥",   "lang": "es", "gl": "MX"},
}

# ───────────────────────────────────────────────
# 金融行业分类（google-play-scraper 支持的 category）
# ───────────────────────────────────────────────
# FINANCE 是 Google Play 的顶级金融大类，包含信贷、理财、保险等所有子类
FINANCE_CATEGORY = "FINANCE"

# 行业关键词映射
INDUSTRY_KEYWORDS: dict[str, list[str]] = {
    "credit": [
        "loan", "loans", "credit", "borrow", "lending", "lend",
        "cash advance", "money lender", "personal finance", "pinjam",
        "kredit", "utang", "pinjaman", "قرض", "advance",
        "installment", "cicil", "cicilan", "hutang",
        "uang tunai", "bayar", "pay later",
    ],
    "insurance": [
        "insurance", "insure", "protect", "cover", "policy",
        "asuransi", "تأمين", "health cover", "life insurance",
        "jiwa", "proteksi", "health plan",
    ],
}


def classify_industry(app_name: str, description: str, category: str = "") -> str:
    """根据关键词匹配APP所属行业"""
    text = (app_name + " " + description + " " + category).lower()
    for industry in ("insurance", "credit"):
        if any(kw.lower() in text for kw in INDUSTRY_KEYWORDS[industry]):
            return industry
    return "finance"  # 默认归入理财类


def parse_installs(installs_str: str) -> int:
    """
    解析 Google Play 安装量字符串（如 "10,000,000+" → 10000000）
    """
    if not installs_str:
        return 0
    clean = installs_str.replace(",", "").replace("+", "").replace(" ", "").strip()
    try:
        return int(float(clean))
    except (ValueError, TypeError):
        return 0


def estimate_dau(min_installs: int, rating: float, reviews: int) -> int:
    """
    DAU 估算模型（无法直接获取，通过指标推算）
    
    算法：DAU ≈ MAU × 0.15～0.25（金融类APP日活率约15-25%）
    MAU ≈ 安装量 × 留存率（金融类约3-8%活跃）
    
    综合公式：DAU ≈ installs × 0.05 × 0.2 = installs × 0.01
    对评分高（>4.2）且评论多（>10000）的APP提权
    """
    if min_installs <= 0:
        return 0
    
    base_rate = 0.01  # 基础日活率 1%
    
    # 评分加权
    if rating >= 4.5:
        rating_multiplier = 1.5
    elif rating >= 4.2:
        rating_multiplier = 1.2
    elif rating >= 3.8:
        rating_multiplier = 1.0
    else:
        rating_multiplier = 0.7
    
    # 评论数加权（评论越多说明用户粘性越高）
    if reviews >= 100000:
        review_multiplier = 1.3
    elif reviews >= 10000:
        review_multiplier = 1.1
    else:
        review_multiplier = 1.0
    
    dau = int(min_installs * base_rate * rating_multiplier * review_multiplier)
    return max(dau, 0)


def scrape_google_play_country(country_code: str, top_n: int = 50) -> List[Dict]:
    """
    使用 google-play-scraper 库爬取单个国家 Google Play 金融榜单
    
    返回 True 数据格式（非 Mock）：
    [{
        id, name, developer, rank, rating, reviews, 
        min_installs, installs_str, dau_estimate,
        icon_url, description, country, country_name, store, industry,
        chinese_parent, parent_relation
    }]
    """
    from google_play_scraper import app as gp_app
    from google_play_scraper import top_chart, Sort
    from google_play_scraper.exceptions import NotFoundError

    country = COUNTRIES.get(country_code)
    if not country:
        print(f"不支持的国家代码: {country_code}")
        return []

    print(f"\n🌏 [{country_code}] {country['name']} - 开始爬取 Google Play 金融榜单")

    apps: List[Dict] = []

    try:
        # Step 1: 获取排行榜（包名列表）
        print(f"   ↳ 获取排行榜 Top {top_n}...")
        chart_result = top_chart(
            chart="topselling_free",
            category=FINANCE_CATEGORY,
            country=country_code,
            lang=country["lang"],
            count=top_n,
        )

        if not chart_result:
            print(f"   ⚠️ [{country_code}] 排行榜返回空")
            return []

        pkg_list: list[str] = chart_result  # 包名列表
        print(f"   ✅ 获取到 {len(pkg_list)} 个包名")

    except Exception as e:
        print(f"   ❌ [{country_code}] 获取排行榜失败: {e}")
        return []

    # Step 2: 批量获取APP详情（含真实安装量）
    for rank, pkg_name in enumerate(pkg_list[:top_n], start=1):
        # 速率控制：避免触发 429
        delay = random.uniform(0.8, 2.0)
        time.sleep(delay)

        try:
            detail = gp_app(
                pkg_name,
                lang=country["lang"],
                country=country_code,
            )

            name = detail.get("title", "")
            description = (detail.get("description", "") or "")[:300]
            developer = detail.get("developer", "")
            rating = float(detail.get("score", 0) or 0)
            reviews = int(detail.get("ratings", 0) or 0)
            min_installs = int(detail.get("minInstalls", 0) or 0)
            real_installs = int(detail.get("realInstalls", 0) or 0)
            installs_str = detail.get("installs", "")  # "10,000,000+"
            icon_url = detail.get("icon", "") or ""

            # 选取更准确的安装量
            actual_installs = real_installs if real_installs > 0 else min_installs

            # 行业分类
            genre = detail.get("genre", "")
            industry = classify_industry(name, description, genre)

            # 母公司查询
            parent_info = lookup_parent(pkg_name, name)

            # DAU 估算
            dau = estimate_dau(actual_installs, rating, reviews)

            app_data: Dict = {
                "id": pkg_name,
                "name": name,
                "developer": developer,
                "rank": rank,
                "rating": round(rating, 2),
                "reviews": reviews,
                "min_installs": actual_installs,
                "installs_str": installs_str,
                "dau_estimate": dau,
                "icon_url": icon_url,
                "description": description[:200],
                "country": country_code,
                "country_name": country["name"],
                "store": "google_play",
                "industry": industry,
                "genre": genre,
                "chinese_parent": parent_info["chinese_parent"],
                "parent_relation": parent_info["relation"],
            }
            apps.append(app_data)
            print(f"   [{rank:2d}] {name[:30]:<30} 安装:{installs_str:<15} 评分:{rating:.1f}")

        except NotFoundError:
            print(f"   ⚠️ 包 {pkg_name} 在 {country_code} 不可用，跳过")
        except Exception as e:
            print(f"   ❌ 获取 {pkg_name} 详情失败: {e}")
            # 降级：仅记录包名和排名
            apps.append({
                "id": pkg_name,
                "name": pkg_name.split(".")[-1].replace("_", " ").title(),
                "developer": "",
                "rank": rank,
                "rating": 0.0,
                "reviews": 0,
                "min_installs": 0,
                "installs_str": "",
                "dau_estimate": 0,
                "icon_url": "",
                "description": "",
                "country": country_code,
                "country_name": country["name"],
                "store": "google_play",
                "industry": "finance",
                "genre": "",
                "chinese_parent": "",
                "parent_relation": "",
            })

    print(f"[{country_code}] Google Play 爬取完成，共 {len(apps)} 个APP")
    return apps


def scrape_all_countries_google_play(top_n: int = 50) -> List[Dict]:
    """
    依次爬取所有国家的 Google Play 金融榜单（各国独立，顺序执行避免IP封锁）
    返回合并列表（包含 country 字段区分各国）
    """
    all_apps: List[Dict] = []
    for country_code in COUNTRIES:
        try:
            apps = scrape_google_play_country(country_code, top_n)
            all_apps.extend(apps)
        except Exception as e:
            print(f"❌ [{country_code}] Google Play 爬取失败: {e}")
        # 国家间冷却（避免触发频率限制）
        cooldown = random.uniform(5, 12)
        print(f"   🕐 国家间冷却 {cooldown:.1f}s...")
        time.sleep(cooldown)
    return all_apps
