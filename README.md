# 海外金融APP投放数据监控平台

## 项目简介

自动爬取菲律宾、印尼、巴基斯坦、马来西亚、澳大利亚、英国 6 个国家的金融类 APP（信贷、理财、保险）排行榜数据，通过 GitHub Pages 展示仪表盘，每 30 分钟自动刷新。

**完全免费运行：**
- 数据采集：GitHub Actions（免费 2000 分钟/月）
- 前端托管：GitHub Pages（免费）
- 数据存储：GitHub 仓库 JSON 文件（免费）

## 部署步骤

### 1. Fork 本仓库

在 GitHub 上 Fork 本仓库到你的账号下。

### 2. 配置 GitHub Secrets（可选，用于微信推送）

在仓库 Settings → Secrets and variables → Actions 中添加：
```
WECHAT_WEBHOOK_URL=你的微信推送Webhook地址
```

### 3. 启用 GitHub Actions

在仓库 Actions 标签页中，启用工作流程。

### 4. 启用 GitHub Pages

在仓库 Settings → Pages 中，设置：
- Source: `GitHub Actions`

### 5. 手动触发第一次采集

在 Actions 中手动触发 `Scrape App Data` 工作流。

## 本地开发

### 爬虫开发

```bash
pip install -r requirements.txt
playwright install chromium
python scripts/collect_data.py
```

### 前端开发

```bash
cd client
npm install
npm run dev
```

## 数据说明

| 数据字段 | 来源 | 说明 |
|---------|------|------|
| 排名 | 直接爬取 | Google Play/App Store 排行榜位置 |
| 评分 | 直接爬取 | 应用商店评分 |
| 评论数 | 直接爬取 | 评论总数 |
| 下载量 | 部分可获取 | Google Play 显示的下载区间（如 1M+） |
| 投放强度指数 | 计算估算 | 基于排名变化+下载量增长推断（0-100） |

## 监控范围

- **国家**：菲律宾（PH）、印尼（ID）、巴基斯坦（PK）、马来西亚（MY）、澳大利亚（AU）、英国（GB）
- **行业**：信贷、理财、保险
- **商店**：Google Play + App Store

## 许可证

MIT License
