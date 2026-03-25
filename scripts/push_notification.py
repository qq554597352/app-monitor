"""
微信推送脚本
采集完成后推送日报到微信
"""
import json
import os
import requests
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"

WECHAT_WEBHOOK_URL = os.environ.get("WECHAT_WEBHOOK_URL", "")


def load_dashboard() -> dict:
    dashboard_file = DATA_DIR / "dashboard.json"
    if dashboard_file.exists():
        with open(dashboard_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def format_report(dashboard: dict) -> str:
    """生成微信推送文案"""
    now = datetime.utcnow()
    date_str = now.strftime("%Y年%m月%d日 %H:%M UTC")

    summary = dashboard.get("summary", {})
    industry_dist = dashboard.get("industry_distribution", {})
    country_dist = dashboard.get("country_distribution", {})
    top_movers = dashboard.get("top_movers", [])

    # 行业分布
    industry_text = (
        f"信贷 {industry_dist.get('credit', 0)} 个 | "
        f"理财 {industry_dist.get('finance', 0)} 个 | "
        f"保险 {industry_dist.get('insurance', 0)} 个"
    )

    # 国家分布
    country_names = {"PH": "🇵🇭菲律宾", "ID": "🇮🇩印尼", "PK": "🇵🇰巴基斯坦",
                     "MY": "🇲🇾马来西亚", "AU": "🇦🇺澳大利亚", "GB": "🇬🇧英国"}
    country_text = " | ".join([
        f"{country_names.get(k, k)} {v}个"
        for k, v in country_dist.items() if v > 0
    ])

    # Top Movers
    top_text = ""
    if top_movers:
        top_text = "\n\n🔥 排名上升最快 TOP5：\n"
        for i, mover in enumerate(top_movers[:5], 1):
            change = mover.get("rank_change", 0) or 0
            name = mover.get("app_name", "Unknown")
            country = mover.get("country_name", "")
            top_text += f"{i}. {name}（{country}）↑{change}位\n"

    report = f"""【海外金融APP监控日报】
{date_str}

📊 监控总览：
共监控 {summary.get('total_apps', 0)} 个金融APP
覆盖 {summary.get('total_countries', 6)} 个国家
平均评分：⭐ {summary.get('avg_rating', 0)}

🏭 行业分布：
{industry_text}

🌍 国家分布：
{country_text}{top_text}

📱 查看完整数据：
https://qq554597352.github.io/app-monitor/"""

    return report.strip()


def push_to_wechat(message: str) -> bool:
    """推送消息到微信（企业微信群机器人Webhook）"""
    if not WECHAT_WEBHOOK_URL:
        print("⚠️ 未配置 WECHAT_WEBHOOK_URL，跳过推送")
        return False

    payload = {
        "msgtype": "text",
        "text": {
            "content": message
        }
    }

    response = requests.post(
        WECHAT_WEBHOOK_URL,
        json=payload,
        timeout=10
    )

    if response.status_code == 200:
        result = response.json()
        if result.get("errcode") == 0:
            print("✅ 微信推送成功")
            return True
        else:
            print(f"❌ 微信推送失败: {result}")
    else:
        print(f"❌ 微信推送请求失败: {response.status_code}")
    return False


def main():
    print("📤 开始推送微信日报...")
    dashboard = load_dashboard()
    if not dashboard:
        print("❌ 无可推送数据")
        return
    
    report = format_report(dashboard)
    print("\n--- 推送内容预览 ---")
    print(report)
    print("-------------------\n")
    
    push_to_wechat(report)


if __name__ == "__main__":
    main()
