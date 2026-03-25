# SOP：GitHub Actions + Python 爬虫项目从零到稳定运行

> 来源：海外金融 APP 监控平台（app-monitor）开发实战复盘  
> 日期：2026-03-25  
> 适用场景：任何"定时触发 → Python 爬虫采集数据 → 提交回 GitHub → 触发前端部署"的 Actions 工程

---

## 一、项目架构模式

```
GitHub Actions (定时/手动触发)
  └─ 安装依赖 (pip install -r requirements.txt)
  └─ 执行采集脚本 (python scripts/collect_data.py)
  └─ 提交数据到仓库 (git add / commit / push)
  └─ 触发前端部署 (GitHub Pages / deploy.yml)
```

---

## 二、坑点清单与标准解法

### 坑1：`git push` 报 "shallow update not allowed"

**现象**：采集、提交都成功，push 时报 `shallow update not allowed`  
**根因**：`actions/checkout` 默认 `fetch-depth: 1`（浅克隆），推送时远端拒绝  
**解法**：

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    fetch-depth: 0   # ← 必须加，拉完整历史
```

---

### 坑2：`git push` 找不到远端

**现象**：`git push` 无报错但实际没推上去，或报 `no upstream branch`  
**根因**：Actions 环境没有默认 upstream，需要显式指定  
**解法**：

```bash
git push origin main   # 不要只写 git push
```

---

### 坑3：Actions Node.js 版本弃用警告

**现象**：日志出现 `Node.js 20 actions are deprecated`  
**根因**：用了固定 commit SHA 引用旧版 Action（如 `actions/checkout@34e11...`）  
**解法**：改用浮动版本标签，GitHub 会自动跟上最新兼容版本：

```yaml
# ❌ 旧写法（锁死旧版，2026-06 起强制不兼容）
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

# ✅ 新写法
uses: actions/checkout@v4
uses: actions/setup-python@v5
```

---

### 坑4：`pip install` 依赖版本冲突 → exit code 1

**现象**：安装依赖阶段直接报 `ResolutionImpossible`，整个 workflow 失败  
**根因**：`requirements.txt` 里存在"幽灵依赖"——某个包从未被代码 import，却锁了一个与其他包冲突的版本  
**本次案例**：

```
app-store-scraper==0.3.5  依赖 requests==2.23.0
↕ 冲突
requests==2.31.0（主项目要求）
```

**排查步骤**：

```bash
# 1. 确认冲突包是否真的被代码使用
grep -r "import app_store_scraper\|from app_store_scraper" .

# 2. 如果没有任何 import → 直接从 requirements.txt 删掉
# 3. 如果有 import → 放开版本限制（去掉 ==，改为 >=）
```

**预防原则**：  
- `requirements.txt` 中每个包都应该能在代码里找到对应的 `import`  
- 定期用 `pip-check` 或 `pipdeptree` 检查依赖树

---

### 坑5：代码里使用了未声明的依赖（ImportError → exit code 1）

**现象**：本地跑没问题，Actions 环境 exit code 1，但日志里看不到任何 Python 报错  
**根因**：代码里 `import` 了一个包，但该包没有写进 `requirements.txt`（本地已安装但 Actions 环境没有）  
**本次案例**：

```python
# app_store_scraper.py 里
try:
    import aiohttp_socks   # ← 未在 requirements.txt 声明
    connector = ...
except ImportError:
    connector = None       # ← ImportError 被 catch，但后续逻辑仍出错
```

**排查命令**：

```bash
# 列出所有 import 语句，逐一对照 requirements.txt
grep -rh "^import \|^from " --include="*.py" . | sort -u
```

**解法**：要么加入 requirements.txt，要么删掉这个依赖换其他方案

---

### 坑6：Python 脚本失败但 Actions 看不到具体报错

**现象**：`执行数据采集` 步骤 exit code 1，但日志里没有 Python 堆栈信息  
**根因**：`asyncio.run(collect())` 完全没有异常捕获，异常在协程内部被吞掉  
**标准 main 入口模板**：

```python
if __name__ == "__main__":
    import sys, traceback, asyncio
    try:
        result = asyncio.run(collect())
        if result is None:
            print("⚠️ 采集完成但无有效数据")
            sys.exit(1)
        print("✅ 采集完成")
        sys.exit(0)
    except Exception as e:
        print(f"❌ 未捕获异常: {e}")
        traceback.print_exc()
        sys.exit(1)
```

---

### 坑7：本地代理代码泄漏到 CI 环境

**现象**：本地开发时用了代理（SOCKS5/HTTP），代理相关代码写进了源码，Actions 环境无代理直接崩溃  
**本次案例**：

```python
# 本地开发时写的
connector = aiohttp_socks.ProxyConnector.from_url("socks5://127.0.0.1:1080")
```

**解法**：CI 环境不能依赖本地代理，改为以下模式：

```python
# 直连 + 重试（适合 CI 环境）
for attempt in range(3):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    break
    except Exception as e:
        print(f"第{attempt+1}次失败: {e}")
        if attempt < 2:
            await asyncio.sleep(2 ** attempt)  # 指数退避
```

---

## 三、GitHub Actions Workflow 最佳实践模板

```yaml
name: 数据采集

on:
  schedule:
    - cron: '0 2 * * *'  # UTC 02:00 = 北京时间 10:00
  workflow_dispatch:       # 允许手动触发，方便调试

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出仓库
        uses: actions/checkout@v4           # ✅ 用浮动标签
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0                    # ✅ 完整历史，避免 push 失败

      - name: 设置 Python 环境
        uses: actions/setup-python@v5       # ✅ 用浮动标签
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: 安装依赖
        run: pip install -r requirements.txt

      - name: 执行数据采集
        id: scrape
        run: python scripts/collect_data.py
        env:
          PYTHONPATH: ${{ github.workspace }}
        continue-on-error: true             # ✅ 采集失败不中断，后续步骤判断处理

      - name: 提交数据
        if: steps.scrape.outcome == 'success'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "data: 自动采集 $(date -u '+%Y-%m-%d %H:%M') UTC"
          git push origin main              # ✅ 显式指定 remote 和 branch

      - name: 输出最终状态
        if: always()
        run: |
          if [ "${{ steps.scrape.outcome }}" = "failure" ]; then
            echo "::error::❌ 数据采集失败，请查看上方日志"
            exit 1
          fi
          echo "✅ 全部完成"
```

---

## 四、requirements.txt 健康检查清单

在提交 `requirements.txt` 前，逐项确认：

- [ ] 每个包都能在代码里找到对应的 `import`（用 `grep -r "import xxx"` 验证）
- [ ] 没有版本冲突（用 `pip install -r requirements.txt --dry-run` 验证）
- [ ] 没有本地专属工具（如代理客户端、IDE 插件）混入
- [ ] aiohttp 版本 ≥ 3.10（兼容 Python 3.12+）
- [ ] Actions 版本使用浮动标签（`@v4` / `@v5`），不锁 SHA

---

## 五、调试速查

| 症状 | 最可能的根因 | 第一步排查 |
|------|------------|---------|
| `shallow update not allowed` | checkout 未加 `fetch-depth: 0` | 检查 workflow YAML |
| `ResolutionImpossible` | 依赖版本冲突 | 看 pip 错误里 `The conflict is caused by` |
| exit code 1 但无 Python 堆栈 | main 入口没有 try-except | 加 `traceback.print_exc()` |
| Actions 用的是旧代码 | 看的是旧 run 的日志 | 手动触发一次新 run 再看 |
| ImportError 在 Actions 中 | 包未写入 requirements.txt | `grep -r "import 包名" .` |
| 本地正常 CI 崩溃 | 本地代理代码泄漏 | 搜 `socks5\|proxy\|127.0.0.1` |
