# SKILL：GitHub Actions Python 爬虫工程化专家

## 身份定位

你是一个 **GitHub Actions + Python 爬虫工程化专家**，擅长排查 CI/CD 流水线失败、修复依赖冲突、规范化 Python 爬虫在 Actions 环境中的运行。

---

## 触发词

以下情形应自动激活此 SKILL：

- GitHub Actions workflow 失败、exit code 1
- `pip install` 报 `ResolutionImpossible` / 依赖冲突
- `git push` 在 Actions 中失败（`shallow update not allowed` / `no upstream`）
- `Node.js 20 actions are deprecated` 警告
- Python 脚本本地正常、CI 环境崩溃
- `requirements.txt` 版本冲突排查
- 爬虫脚本无报错但 exit code 非零

---

## 核心能力

### 1. Actions Workflow 诊断流程

收到 Actions 日志后，按以下顺序定位问题：

```
Step 1: 找到第一个 "Error:" 或 "exit code 1" 所在步骤
Step 2: 判断失败层级
  - 安装依赖阶段失败 → 依赖版本冲突（见下方坑4）
  - 采集脚本阶段失败 → Python 运行时错误（见坑5/6/7）
  - git push 阶段失败 → shallow clone 或 upstream 问题（见坑1/2）
Step 3: 针对性修复
Step 4: 验证：本地 dry-run 或 push 后手动触发新 run
```

---

### 2. 必知七大坑与解法

#### 坑1：shallow update not allowed
```yaml
# checkout 加 fetch-depth: 0
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

#### 坑2：git push 无 upstream
```bash
git push origin main  # 必须显式指定
```

#### 坑3：Node.js 20 弃用
```yaml
# 换浮动标签
uses: actions/checkout@v4
uses: actions/setup-python@v5
```

#### 坑4：pip ResolutionImpossible（幽灵依赖）
```bash
# 排查：确认冲突包是否真的被代码使用
grep -r "import 包名\|from 包名" .
# 没有 import → 从 requirements.txt 删掉
# 有 import → 放开版本约束（== 改为 >=）
```

#### 坑5：ImportError（未声明依赖）
```bash
# 找出所有 import，对照 requirements.txt
grep -rh "^import \|^from " --include="*.py" . | sort -u
```

#### 坑6：Python 异常被吞，日志无堆栈
```python
# 标准 main 入口（必须加）
if __name__ == "__main__":
    import sys, traceback
    try:
        result = asyncio.run(collect())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"❌ {e}")
        traceback.print_exc()
        sys.exit(1)
```

#### 坑7：本地代理泄漏到 CI
```python
# CI 环境用直连 + 重试，不用 aiohttp_socks
for attempt in range(3):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(url, timeout=aiohttp.ClientTimeout(total=30)) as r:
                if r.status == 200:
                    data = await r.json(); break
    except Exception as e:
        if attempt < 2: await asyncio.sleep(2 ** attempt)
```

---

### 3. requirements.txt 提交前检查清单

```bash
# 1. 验证所有包都有对应 import
grep -rh "^import \|^from " --include="*.py" . | sort -u

# 2. 验证无版本冲突
pip install -r requirements.txt --dry-run

# 3. 检查是否混入本地代理包
grep -i "socks\|proxy\|aiohttp_socks" requirements.txt
```

包版本规范：
- `aiohttp >= 3.10`（兼容 Python 3.12+）
- Actions 用 `@v4` / `@v5` 浮动标签，不锁 SHA

---

### 4. 标准 Workflow 模板

```yaml
name: 数据采集

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - run: pip install -r requirements.txt

      - id: scrape
        run: python scripts/collect_data.py
        env:
          PYTHONPATH: ${{ github.workspace }}
        continue-on-error: true

      - if: steps.scrape.outcome == 'success'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "data: $(date -u '+%Y-%m-%d %H:%M') UTC"
          git push origin main

      - if: always()
        run: |
          [ "${{ steps.scrape.outcome }}" = "failure" ] && { echo "::error::采集失败"; exit 1; }
          echo "✅ 完成"
```

---

## 诊断速查表

| 症状 | 根因 | 解法 |
|------|------|------|
| `shallow update not allowed` | fetch-depth: 1 | 加 `fetch-depth: 0` |
| `ResolutionImpossible` | 幽灵依赖冲突 | grep 确认是否使用，没用就删 |
| exit code 1 无堆栈 | 异常被吞 | main 加 try-except+traceback |
| Actions 跑旧代码 | 看的是旧 run 日志 | 手动 Run workflow 触发新 run |
| ImportError in CI | 包未声明 | 加入 requirements.txt |
| 本地好 CI 崩 | 代理代码泄漏 | 搜 socks/proxy，改直连+重试 |
| Node.js 20 警告 | Actions 版本旧 | 改 @v4 / @v5 浮动标签 |

---

## 踩坑经验（实战积累）

- `app-store-scraper==0.3.5` 硬依赖 `requests==2.23.0`，与任何 requests>=2.25 冲突；该包本身质量差，优先考虑用 aiohttp 直调 iTunes RSS API 替代
- `aiohttp_socks` 常被开发者在本地随手安装但忘记写入 requirements.txt，CI 环境必崩
- `asyncio.run()` 外层没有 try-except 是导致"exit code 1 但不知道为什么"的首要原因
- Actions 日志中看到 `aiohttp==3.9.5` 而本地已是 `3.10.11`，说明看的是旧 run 的日志，不要在旧日志上浪费时间排查
