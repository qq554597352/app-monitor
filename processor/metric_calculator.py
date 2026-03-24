"""
指标计算引擎
- 排名变化率
- 安装量变化率
- DAU 估算变化
- 广告投放强度指数（综合多维推断）
"""
from typing import List, Dict, Optional
import math


def calculate_rank_change(current: Optional[int], previous: Optional[int]) -> Optional[int]:
    """
    计算排名变化（正数=上升，负数=下降）
    """
    if current is None or previous is None:
        return None
    return previous - current


def calculate_rating_change(current: Optional[float], previous: Optional[float]) -> Optional[float]:
    """计算评分变化"""
    if current is None or previous is None:
        return None
    return round(current - previous, 2)


def calculate_installs_change(current: int, previous: int) -> Optional[int]:
    """计算安装量变化（绝对值）"""
    if current == 0 and previous == 0:
        return None
    if previous == 0:
        return None
    return current - previous


def calculate_installs_growth_rate(current: int, previous: int) -> Optional[float]:
    """计算安装量增长率（%）"""
    if previous <= 0:
        return None
    if current <= 0:
        return None
    rate = (current - previous) / previous * 100
    return round(rate, 2)


def calculate_ad_spend_intensity(
    rank: Optional[int],
    rank_change: Optional[int],
    reviews: Optional[int],
    reviews_change: Optional[int],
    min_installs: int = 0,
    installs_change: Optional[int] = None,
    previous_intensity: Optional[float] = None,
) -> float:
    """
    计算广告投放强度指数（0–100）
    综合4个信号：
    
    1. 排名绝对值（25%）：排名越靠前流量越大
    2. 排名上升速度（35%）：上升越快越可能在投放
    3. 安装量增长速度（25%）：真实流量增量
    4. 评论增长速度（15%）：新用户粘性信号
    """
    score = 0.0
    rank_score = 0.0

    # ── 信号1：排名绝对值 ──
    if rank is not None:
        if rank <= 5:
            rank_score = 100.0
        elif rank <= 10:
            rank_score = 85.0
        elif rank <= 20:
            rank_score = 65.0
        elif rank <= 30:
            rank_score = 45.0
        elif rank <= 50:
            rank_score = 25.0
        else:
            rank_score = 10.0
        score += rank_score * 0.25

    # ── 信号2：排名上升速度 ──
    if rank_change is not None:
        if rank_change >= 30:
            velocity_score = 100.0
        elif rank_change >= 20:
            velocity_score = 85.0
        elif rank_change >= 10:
            velocity_score = 65.0
        elif rank_change >= 5:
            velocity_score = 45.0
        elif rank_change >= 1:
            velocity_score = 25.0
        elif rank_change >= -5:
            velocity_score = 10.0
        else:
            velocity_score = 0.0
        score += velocity_score * 0.35
    else:
        # 无历史数据时用排名信号补充
        score += rank_score * 0.35

    # ── 信号3：安装量增长速度 ──
    if installs_change is not None and min_installs > 0:
        growth_rate = installs_change / max(min_installs - installs_change, 1) * 100
        if growth_rate >= 50:
            install_score = 100.0
        elif growth_rate >= 20:
            install_score = 75.0
        elif growth_rate >= 10:
            install_score = 50.0
        elif growth_rate >= 5:
            install_score = 30.0
        elif growth_rate >= 1:
            install_score = 15.0
        else:
            install_score = 0.0
        score += install_score * 0.25
    else:
        score += rank_score * 0.25

    # ── 信号4：评论增长速度 ──
    if reviews_change is not None and reviews_change > 0:
        if reviews_change >= 10000:
            review_score = 100.0
        elif reviews_change >= 5000:
            review_score = 75.0
        elif reviews_change >= 1000:
            review_score = 50.0
        elif reviews_change >= 100:
            review_score = 25.0
        else:
            review_score = 10.0
        score += review_score * 0.15
    else:
        score += rank_score * 0.15

    # 平滑：避免分数剧烈波动
    if previous_intensity is not None:
        score = score * 0.65 + previous_intensity * 0.35

    return round(min(max(score, 0), 100), 1)


def calculate_metrics_with_history(
    current_metrics: List[Dict],
    previous_metrics: List[Dict],
) -> List[Dict]:
    """结合历史数据计算全量变化指标"""
    prev_map = {
        f"{m['app_id']}_{m['country_code']}_{m['store']}": m
        for m in previous_metrics
    }

    enriched = []
    for metric in current_metrics:
        key = f"{metric['app_id']}_{metric['country_code']}_{metric['store']}"
        prev = prev_map.get(key)

        # 排名变化
        rank_change = calculate_rank_change(metric.get("rank"), prev.get("rank") if prev else None)

        # 评分变化
        rating_change = calculate_rating_change(metric.get("rating"), prev.get("rating") if prev else None)

        # 评论变化
        cur_reviews = metric.get("reviews") or 0
        prev_reviews = (prev.get("reviews") or 0) if prev else 0
        reviews_change = (cur_reviews - prev_reviews) if prev else None

        # 安装量变化
        cur_installs = metric.get("min_installs") or 0
        prev_installs = (prev.get("min_installs") or 0) if prev else 0
        installs_change = calculate_installs_change(cur_installs, prev_installs) if prev else None
        installs_growth = calculate_installs_growth_rate(cur_installs, prev_installs) if prev else None

        # DAU 变化
        cur_dau = metric.get("dau_estimate") or 0
        prev_dau = (prev.get("dau_estimate") or 0) if prev else 0
        dau_change = (cur_dau - prev_dau) if prev and prev_dau > 0 else None

        # 投放强度
        prev_intensity = prev.get("ad_spend_intensity") if prev else None
        ad_intensity = calculate_ad_spend_intensity(
            rank=metric.get("rank"),
            rank_change=rank_change,
            reviews=cur_reviews,
            reviews_change=reviews_change,
            min_installs=cur_installs,
            installs_change=installs_change,
            previous_intensity=prev_intensity,
        )

        metric["rank_change"]        = rank_change
        metric["rating_change"]      = rating_change
        metric["reviews_change"]     = reviews_change
        metric["installs_change"]    = installs_change
        metric["installs_growth"]    = installs_growth
        metric["dau_change"]         = dau_change
        metric["ad_spend_intensity"] = ad_intensity
        metric["is_new"]             = prev is None

        enriched.append(metric)

    return enriched
