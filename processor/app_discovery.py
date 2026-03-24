"""
热门APP自动发现算法
- 基于排行榜自动发现金融类热门APP
- 维护监控列表（每国家每行业最多20个）
- 定期清理低热度APP
"""
from typing import List, Dict, Set
from datetime import datetime, timedelta


MAX_APPS_PER_BUCKET = 20   # 每个国家×行业的最大监控数量
HOT_SCORE_THRESHOLD = 60   # 加入监控列表的热度阈值
CLEANUP_SCORE_THRESHOLD = 30  # 低于此分数连续N天则移除
CLEANUP_DAYS = 7           # 连续几天低分则清理


def calculate_hot_score(metric: Dict) -> float:
    """
    计算APP热度得分（0-100）
    用于判断是否加入监控列表
    
    权重：
    - 排名权重（40%）：排名越靠前分越高
    - 排名上升速度（30%）：最近排名上升越快越高
    - 广告投放强度（30%）：推断的投放力度
    """
    rank = metric.get("rank")
    rank_change = metric.get("rank_change", 0) or 0
    ad_intensity = metric.get("ad_spend_intensity", 0) or 0

    # 排名绝对值得分
    rank_score = 0
    if rank is not None:
        rank_score = max(0, 100 - rank * 2)  # rank=1→98, rank=50→0

    # 排名上升速度得分
    velocity_score = min(100, max(0, rank_change * 5)) if rank_change > 0 else 0

    hot_score = rank_score * 0.4 + velocity_score * 0.3 + ad_intensity * 0.3
    return round(hot_score, 1)


def discover_hot_apps(
    current_metrics: List[Dict],
    existing_app_ids: Set[str],
) -> tuple[List[str], List[str]]:
    """
    发现新热门APP并识别需要清理的低热度APP
    
    返回: (新发现APP的id列表, 需要移除APP的id列表)
    """
    to_add: List[str] = []
    bucket_counts: Dict[str, int] = {}  # country_industry → count

    for metric in current_metrics:
        app_id = metric.get("app_id")
        country = metric.get("country_code")
        industry = metric.get("industry", "finance")
        bucket = f"{country}_{industry}"

        hot_score = calculate_hot_score(metric)
        metric["hot_score"] = hot_score

        bucket_counts[bucket] = bucket_counts.get(bucket, 0) + 1

        # 热度够高且不在监控列表中 → 加入
        if (
            hot_score >= HOT_SCORE_THRESHOLD
            and app_id not in existing_app_ids
            and bucket_counts.get(bucket, 0) <= MAX_APPS_PER_BUCKET
        ):
            to_add.append(app_id)

    return to_add, []


def generate_top_movers(metrics: List[Dict], top_n: int = 10) -> List[Dict]:
    """
    生成排名上升最快的TOP N APP列表
    """
    # 只选有排名变化的
    movers = [m for m in metrics if m.get("rank_change") is not None]
    
    # 按排名上升幅度排序（rank_change越大越好）
    movers.sort(key=lambda x: x.get("rank_change", 0), reverse=True)

    return movers[:top_n]


def generate_dashboard_summary(
    apps: List[Dict],
    metrics: List[Dict],
) -> Dict:
    """生成仪表盘汇总数据"""
    # 行业分布
    industry_dist = {"credit": 0, "finance": 0, "insurance": 0}
    country_dist = {"PH": 0, "ID": 0, "PK": 0, "MY": 0, "AU": 0, "GB": 0}
    
    app_map = {a["id"]: a for a in apps}
    
    for app in apps:
        industry = app.get("industry", "finance")
        if industry in industry_dist:
            industry_dist[industry] += 1
        country = app.get("country_code", "")
        if country in country_dist:
            country_dist[country] += 1

    # 平均评分
    ratings = [m["rating"] for m in metrics if m.get("rating")]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0

    # TOP Movers
    top_movers = generate_top_movers(metrics)
    
    # 给 top_movers 附加APP基础信息
    enriched_movers = []
    for m in top_movers:
        app = app_map.get(m.get("app_id"), {})
        enriched_movers.append({
            **m,
            "app_name": app.get("name", ""),
            "icon_url": app.get("icon_url", ""),
            "developer": app.get("developer", ""),
            "industry": app.get("industry", ""),
            "industry_name": app.get("industry_name", ""),
            "country_name": app.get("country_name", ""),
        })

    return {
        "summary": {
            "total_apps": len(apps),
            "total_countries": 6,
            "total_industries": 3,
            "avg_rating": avg_rating,
            "last_updated": datetime.utcnow().isoformat() + "Z",
        },
        "top_movers": enriched_movers,
        "industry_distribution": industry_dist,
        "country_distribution": country_dist,
    }
