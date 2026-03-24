"""processor 模块初始化"""
from .data_normalizer import normalize_all, normalize_app, normalize_metric
from .metric_calculator import calculate_metrics_with_history, calculate_ad_spend_intensity
from .app_discovery import discover_hot_apps, generate_dashboard_summary

__all__ = [
    "normalize_all",
    "normalize_app",
    "normalize_metric",
    "calculate_metrics_with_history",
    "calculate_ad_spend_intensity",
    "discover_hot_apps",
    "generate_dashboard_summary",
]
