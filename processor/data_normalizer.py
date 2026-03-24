"""
数据清洗与标准化模块
统一国家代码、行业分类、字段格式
新增：母公司、安装量、DAU 估算字段
"""
from typing import List, Dict, Optional
from datetime import datetime

# 国家映射
COUNTRY_MAP = {
    "PH": "菲律宾",
    "ID": "印尼",
    "PK": "巴基斯坦",
    "MY": "马来西亚",
    "AU": "澳大利亚",
    "GB": "英国",
    "MX": "墨西哥",
}

# 行业映射（英文 → 中文）
INDUSTRY_MAP = {
    "credit":    "信贷",
    "finance":   "理财",
    "insurance": "保险",
}

# 商店映射
STORE_MAP = {
    "google_play": "Google Play",
    "app_store":   "App Store",
}


def normalize_app(raw: Dict) -> Optional[Dict]:
    """标准化单个APP基础信息"""
    if not raw.get("name") or not raw.get("id"):
        return None

    country_code = (raw.get("country_code") or raw.get("country") or "").upper()
    industry = raw.get("industry", "finance")

    return {
        "id":           str(raw.get("id", "")),
        "name":         str(raw.get("name", "")).strip(),
        "developer":    str(raw.get("developer", "")).strip(),
        "country_code": country_code,
        "country_name": COUNTRY_MAP.get(country_code, country_code),
        "industry":     industry,
        "industry_name":INDUSTRY_MAP.get(industry, industry),
        "store":        raw.get("store", "unknown"),
        "store_name":   STORE_MAP.get(raw.get("store", ""), "Unknown"),
        "icon_url":     str(raw.get("icon_url", "")),
        "description":  str(raw.get("description", ""))[:200],
        "app_store_url":raw.get("app_store_url", ""),
        # 新增：母公司信息
        "chinese_parent":  str(raw.get("chinese_parent", "")),
        "parent_relation": str(raw.get("parent_relation", "")),
    }


def normalize_metric(raw: Dict, timestamp: str) -> Optional[Dict]:
    """标准化单个指标数据（含安装量、DAU 估算）"""
    if not raw.get("id"):
        return None

    min_installs = int(raw.get("min_installs", 0) or 0)
    installs_str = str(raw.get("installs_str", ""))
    dau_estimate = int(raw.get("dau_estimate", 0) or 0)

    return {
        "app_id":          str(raw.get("id", "")),
        "country_code":    (raw.get("country_code") or raw.get("country") or "").upper(),
        "store":           raw.get("store", "unknown"),
        "timestamp":       timestamp,
        # 排行榜排名
        "rank":            int(raw.get("rank", 0)) if raw.get("rank") else None,
        # 评分
        "rating":          float(raw.get("rating", 0)) if raw.get("rating") else None,
        # 评论 / 评分数
        "reviews":         int(raw.get("reviews", 0)) if raw.get("reviews") else None,
        # 安装量（Google Play 真实值 / App Store 估算值）
        "min_installs":    min_installs,
        "installs_str":    installs_str,
        # DAU 估算
        "dau_estimate":    dau_estimate,
        # 广告投放强度（后续由 metric_calculator 计算）
        "ad_spend_intensity": None,
    }


def deduplicate_apps(apps: List[Dict]) -> List[Dict]:
    """去重：同一APP同一国家+平台只保留一条"""
    seen = set()
    result = []
    for app in apps:
        key = f"{app.get('id')}_{app.get('country_code')}_{app.get('store')}"
        if key not in seen:
            seen.add(key)
            result.append(app)
    return result


def normalize_all(raw_apps: List[Dict]) -> tuple[List[Dict], List[Dict]]:
    """
    标准化全量APP数据
    返回: (apps列表, metrics列表)
    """
    timestamp = datetime.utcnow().isoformat() + "Z"

    apps = []
    metrics = []

    for raw in raw_apps:
        app = normalize_app(raw)
        metric = normalize_metric(raw, timestamp)

        if app:
            apps.append(app)
        if metric:
            metrics.append(metric)

    apps = deduplicate_apps(apps)

    return apps, metrics
