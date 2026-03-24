"""
数据采集主脚本
GitHub Actions 定时任务调用入口
支持 Google Play 真实数据 + App Store 估算数据
"""
import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

# 添加项目根目录到 Python 路径
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from scraper.google_play_scraper import scrape_all_countries_google_play
from scraper.app_store_scraper import scrape_all_countries_app_store
from processor.data_normalizer import normalize_all
from processor.metric_calculator import calculate_metrics_with_history
from processor.app_discovery import generate_dashboard_summary

DATA_DIR = ROOT / "data"
HISTORY_DIR = DATA_DIR / "history"


def load_json(path: Path):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {} if path.suffix == ".json" and "dashboard" in path.name else []


def save_json(path: Path, data, indent: int = 2) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)
    print(f"✅ 已保存: {path} ({len(data) if isinstance(data, list) else '...'})")


def merge_apps(existing: list, new_apps: list) -> list:
    """合并APP列表（新数据覆盖旧数据，保留所有新发现APP）"""
    existing_map = {
        f"{a['id']}_{a.get('country_code', '')}_{a.get('store', '')}": a
        for a in existing
    }
    for app in new_apps:
        key = f"{app['id']}_{app.get('country_code', '')}_{app.get('store', '')}"
        existing_map[key] = app  # 用新数据覆盖
    return list(existing_map.values())


async def collect():
    """主采集函数"""
    start_time = time.time()
    print(f"\n{'='*60}")
    print(f"🚀 开始采集 - {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print('='*60)

    # ────────────────────────────────────────────────
    # Step 1: 采集 Google Play 数据（同步库，顺序执行）
    # ────────────────────────────────────────────────
    TOP_N = int(os.environ.get("SCRAPE_TOP_N", "30"))  # CI 默认30，本地可设50
    print(f"\n📱 [1/5] 采集 Google Play 数据（真实安装量，每国 Top {TOP_N}）...")
    gp_apps_raw = []
    try:
        # google-play-scraper 是同步库，在线程池中运行
        loop = asyncio.get_event_loop()
        gp_apps_raw = await loop.run_in_executor(
            None, scrape_all_countries_google_play, TOP_N
        )
        print(f"   ✅ Google Play: {len(gp_apps_raw)} 条")
    except Exception as e:
        print(f"   ❌ Google Play 采集失败: {e}")

    # ────────────────────────────────────────────────
    # Step 2: 采集 App Store 数据（异步）
    # ────────────────────────────────────────────────
    print(f"\n🍎 [2/5] 采集 App Store 数据（安装量估算，每国 Top {TOP_N}）...")
    as_apps_raw = []
    try:
        as_apps_raw = await scrape_all_countries_app_store(top_n=TOP_N)
        print(f"   ✅ App Store: {len(as_apps_raw)} 条")
    except Exception as e:
        print(f"   ❌ App Store 采集失败: {e}")

    all_raw = gp_apps_raw + as_apps_raw
    print(f"\n📊 原始数据合计: {len(all_raw)} 条")

    if not all_raw:
        print("⚠️ 无有效数据，采集终止")
        return None

    # ────────────────────────────────────────────────
    # Step 3: 数据清洗与标准化
    # ────────────────────────────────────────────────
    print("\n🔄 [3/5] 数据清洗与标准化...")
    new_apps, new_metrics = normalize_all(all_raw)
    print(f"   标准化后: {len(new_apps)} 个APP, {len(new_metrics)} 条指标")

    # 打印各国统计
    country_counts: dict[str, int] = {}
    for a in new_apps:
        cc = a.get("country_code", "?")
        country_counts[cc] = country_counts.get(cc, 0) + 1
    for cc, cnt in sorted(country_counts.items()):
        print(f"   [{cc}] {cnt} 个APP")

    # ────────────────────────────────────────────────
    # Step 4: 计算变化指标
    # ────────────────────────────────────────────────
    print("\n📈 [4/5] 计算变化指标...")
    existing_apps = load_json(DATA_DIR / "apps.json")
    if isinstance(existing_apps, dict):
        existing_apps = existing_apps.get("apps", [])

    prev_metrics = load_json(DATA_DIR / "metrics_latest.json")
    if not isinstance(prev_metrics, list):
        prev_metrics = []

    enriched_metrics = calculate_metrics_with_history(new_metrics, prev_metrics)
    merged_apps = merge_apps(existing_apps, new_apps)
    print(f"   合并后共 {len(merged_apps)} 个APP（含历史新发现）")

    # ────────────────────────────────────────────────
    # Step 5: 生成仪表盘汇总 + 保存
    # ────────────────────────────────────────────────
    print("\n💾 [5/5] 生成汇总并保存数据...")
    dashboard = generate_dashboard_summary(merged_apps, enriched_metrics)

    save_json(DATA_DIR / "apps.json", merged_apps)
    save_json(DATA_DIR / "metrics_latest.json", enriched_metrics)
    save_json(DATA_DIR / "dashboard.json", dashboard)

    # 历史快照
    today = datetime.utcnow().strftime("%Y-%m-%d")
    save_json(HISTORY_DIR / f"{today}.json", {
        "date": today,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "apps_count": len(merged_apps),
        "metrics": enriched_metrics,
    })

    elapsed = time.time() - start_time
    print(f"\n✅ 采集完成！耗时 {elapsed:.1f}s")
    print(f"   📊 信贷APP: {dashboard['industry_distribution'].get('credit', 0)} 个")
    print(f"   💰 理财APP: {dashboard['industry_distribution'].get('finance', 0)} 个")
    print(f"   🛡️ 保险APP: {dashboard['industry_distribution'].get('insurance', 0)} 个")

    # 统计有母公司信息的APP数量
    with_parent = sum(1 for a in merged_apps if a.get("chinese_parent"))
    print(f"   🏢 已知母公司: {with_parent} 个APP")

    return dashboard


if __name__ == "__main__":
    asyncio.run(collect())
