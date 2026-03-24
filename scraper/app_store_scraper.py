"""
Apple App Store 排行榜爬虫
使用 App Store 官方 RSS Feed（免费接口）+ iTunes Lookup API
支持多国家 / 金融类APP爬取，并估算安装量和DAU
"""
import asyncio
import json
import time
import random
from typing import List, Dict
import aiohttp
from .anti_spider import get_browser_headers, async_rate_limit
from .google_play_scraper import classify_industry, estimate_dau
from .parent_company_db import lookup_parent

# App Store 国家代码
APP_STORE_COUNTRIES = {
    "PH": "ph",
    "ID": "id",
    "PK": "pk",
    "MY": "my",
    "AU": "au",
    "GB": "gb",
}

# 各国 App Store 评论数 → 安装量估算系数（信贷金融类）
# 经验公式：安装量 ≈ 评论数 × 系数（金融类评论转化率较低，约0.5-1.5%）
REVIEW_TO_INSTALL_RATIO = {
    "PH": 120,   # 菲律宾用户评论率低
    "ID": 100,   # 印尼
    "PK": 130,   # 巴基斯坦
    "MY": 90,    # 马来西亚用户相对活跃
    "AU": 80,    # 澳大利亚
    "GB": 70,    # 英国，用户更倾向评论
}


def estimate_installs_from_reviews(reviews: int, country_code: str, rank: int) -> int:
    """
    通过评论数估算 App Store 安装量
    
    由于 App Store 不公开安装量，通过以下方式估算：
    1. 评论数 × 国家系数（主要）
    2. 排名加权（排名越高，安装量基数越大）
    """
    if reviews <= 0:
        # 无评论数时通过排名估算基础量
        if rank <= 5:
            return 500000
        elif rank <= 10:
            return 200000
        elif rank <= 20:
            return 100000
        elif rank <= 50:
            return 50000
        return 10000

    ratio = REVIEW_TO_INSTALL_RATIO.get(country_code, 100)
    base = reviews * ratio

    # 排名加权（越靠前估算越高）
    if rank <= 5:
        multiplier = 1.5
    elif rank <= 10:
        multiplier = 1.2
    elif rank <= 20:
        multiplier = 1.0
    else:
        multiplier = 0.8

    return int(base * multiplier)


async def scrape_app_store_charts(country_code: str, top_n: int = 50) -> List[Dict]:
    """
    使用 App Store RSS Feed 官方接口爬取金融类排行榜
    URL: https://rss.applemarketingtools.com/api/v2/{country}/apps/top-free/{top_n}/finance.json
    """
    store_country = APP_STORE_COUNTRIES.get(country_code, country_code.lower())
    url = f"https://rss.applemarketingtools.com/api/v2/{store_country}/apps/top-free/{top_n}/finance.json"

    print(f"\n🍎 [{country_code}] 开始获取 App Store 金融榜单: {url}")

    await async_rate_limit("rss.applemarketingtools.com")

    headers = get_browser_headers("https://apps.apple.com/")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status != 200:
                    print(f"App Store [{country_code}] 请求失败: {response.status}")
                    return []
                data = await response.json(content_type=None)
        except Exception as e:
            print(f"App Store [{country_code}] 请求异常: {e}")
            return []

    apps = _parse_app_store_feed(data, country_code)
    apps = await _enrich_app_details(apps, store_country, country_code)
    print(f"[{country_code}] App Store 爬取完成，获取 {len(apps)} 个APP")
    return apps


def _parse_app_store_feed(data: Dict, country_code: str) -> List[Dict]:
    """解析 App Store RSS Feed JSON"""
    apps = []
    results = data.get("feed", {}).get("results", [])
    country_name_map = {
        "PH": "菲律宾", "ID": "印尼", "PK": "巴基斯坦",
        "MY": "马来西亚", "AU": "澳大利亚", "GB": "英国",
    }
    for i, item in enumerate(results):
        app_name = item.get("name", "")
        genre = item.get("genres", [""])[0] if item.get("genres") else ""
        app = {
            "id": item.get("id", ""),
            "name": app_name,
            "developer": item.get("artistName", ""),
            "rank": i + 1,
            "rating": 0.0,
            "reviews": 0,
            "min_installs": 0,
            "installs_str": "",
            "dau_estimate": 0,
            "icon_url": item.get("artworkUrl100", ""),
            "country": country_code,
            "country_name": country_name_map.get(country_code, country_code),
            "store": "app_store",
            "industry": classify_industry(app_name, genre),
            "description": "",
            "app_store_url": item.get("url", ""),
            "genres": item.get("genres", []),
            "chinese_parent": "",
            "parent_relation": "",
        }
        apps.append(app)
    return apps


async def _enrich_app_details(apps: List[Dict], store_country: str, country_code: str) -> List[Dict]:
    """通过 iTunes Lookup API 获取APP详细信息（评分、评论数等），并计算安装量估算"""
    if not apps:
        return apps

    batch_size = 20
    enriched = []

    for i in range(0, len(apps), batch_size):
        batch = apps[i:i + batch_size]
        app_ids = ",".join([a["id"] for a in batch if a["id"]])

        if not app_ids:
            enriched.extend(batch)
            continue

        lookup_url = f"https://itunes.apple.com/lookup?id={app_ids}&country={store_country}"
        await async_rate_limit("itunes.apple.com")
        headers = get_browser_headers()

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    lookup_url, headers=headers, timeout=aiohttp.ClientTimeout(total=20)
                ) as response:
                    if response.status == 200:
                        detail_data = await response.json(content_type=None)
                        details_map = {
                            str(r["trackId"]): r
                            for r in detail_data.get("results", [])
                            if "trackId" in r
                        }
                        for app in batch:
                            detail = details_map.get(str(app["id"]))
                            if detail:
                                rating = float(detail.get("averageUserRating", 0) or 0)
                                reviews = int(detail.get("userRatingCount", 0) or 0)
                                desc = (detail.get("description", "") or "")[:200]
                                developer = detail.get("sellerName", app["developer"])
                                bundle_id = detail.get("bundleId", "")

                                # 估算安装量
                                est_installs = estimate_installs_from_reviews(
                                    reviews, country_code, app["rank"]
                                )
                                dau = estimate_dau(est_installs, rating, reviews)

                                # 母公司查询（用 bundleId 或 APP名）
                                parent_info = lookup_parent(bundle_id or app["id"], app["name"])

                                app.update({
                                    "rating": round(rating, 2),
                                    "reviews": reviews,
                                    "min_installs": est_installs,
                                    "installs_str": f"{est_installs:,}+（估算）",
                                    "dau_estimate": dau,
                                    "description": desc,
                                    "developer": developer,
                                    "chinese_parent": parent_info["chinese_parent"],
                                    "parent_relation": parent_info["relation"],
                                })
                            else:
                                # lookup 没有命中，用排名基础估算
                                est_installs = estimate_installs_from_reviews(0, country_code, app["rank"])
                                app["min_installs"] = est_installs
                                app["installs_str"] = f"~{est_installs:,}（排名估算）"
                                app["dau_estimate"] = estimate_dau(est_installs, 0, 0)
                                # 母公司查询（仅APP名）
                                parent_info = lookup_parent(app["id"], app["name"])
                                app["chinese_parent"] = parent_info["chinese_parent"]
                                app["parent_relation"] = parent_info["relation"]
                            enriched.append(app)
                    else:
                        enriched.extend(batch)
            except Exception as e:
                print(f"iTunes Lookup 失败: {e}")
                enriched.extend(batch)

        await asyncio.sleep(random.uniform(1.5, 3.0))

    return enriched if enriched else apps


async def scrape_all_countries_app_store(top_n: int = 50) -> List[Dict]:
    """爬取所有国家的 App Store 金融榜单"""
    all_apps = []
    for country_code in APP_STORE_COUNTRIES:
        apps = await scrape_app_store_charts(country_code, top_n)
        all_apps.extend(apps)
        await asyncio.sleep(random.uniform(2, 5))
    return all_apps
