# SEO 闭环优化自动化工具

这组脚本实现了一个轻量、可审阅的 SEO 闭环：

1. **fetch_gsc_data.py** — 从 Google Search Console 获取近 7 天数据，筛选出 `ctr=0` 且 `impressions>30` 的页面。
2. **analyze_seo.py** — 把这些页面传给 Claude 3.5 / GPT-4o，让 AI 分析为什么没点击，并给出 3 组更吸引人的标题/描述建议。
3. **输出** — 保存为 `optimization_suggestions.json`（结构化）和 `optimization_suggestions_review.md`（人工审阅）。

## 目录

```
scripts/seo/
├── .env.example                 # 环境变量模板
├── requirements.txt             # Python 依赖
├── README.md                    # 本文件
├── fetch_gsc_data.py            # 获取 GSC 数据
├── analyze_seo.py               # AI 分析
├── run_seo_pipeline.py          # 一键运行完整流程
├── gsc_optimization_candidates.json   # 中间输出
├── optimization_suggestions.json      # 结构化建议
└── optimization_suggestions_review.md # Markdown 审阅版
```

## 1. Google Cloud Console 配置（GSC API）

### 需要开通的 API
1. 打开 [Google Cloud Console](https://console.cloud.google.com/)。
2. 选择/创建你的项目。
3. 进入 **APIs & Services → Library**。
4. 搜索并启用 **Google Search Console API**。

### 需要申请的 OAuth / 凭据
1. 进入 **APIs & Services → Credentials**。
2. 点击 **Create Credentials → OAuth client ID**。
3. 应用类型选择 **Desktop app**（本地脚本最方便）。
4. 下载生成的 JSON 文件，重命名为 `gsc_credentials.json`，放到 `scripts/seo/` 目录下。
5. 第一次运行脚本时，浏览器会弹出 Google 授权窗口，允许访问 Search Console 数据即可。

### 需要 GSC 权限
运行账号必须对 `https://getfastcalc.com/` 这个 GSC 属性拥有 **Owner** 或 **Full user** 权限。否则 API 会返回 403 / 404。

在 [Google Search Console](https://search.google.com/search-console) 中：
- 选择 `getfastcalc.com`（通常是域名属性，格式为 `sc-domain:getfastcalc.com` 或 `https://getfastcalc.com/`）。
- 进入 **Settings → Users and permissions**。
- 确保你授权的那个 Google 账号有 **Owner** 或 **Full user** 角色。

> **注意**：GSC API 的域名属性（Domain property）需要 DNS 验证，所以请确认你使用的属性格式。如果是 `sc-domain:` 开头，`GSC_SITE_URL` 也写 `sc-domain:getfastcalc.com`。

## 2. 本地环境配置

```bash
cd scripts/seo
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# 编辑 .env 填入你的 API key 和 GSC 凭据路径
```

### .env 关键字段说明

```bash
# GSC OAuth 2.0 凭据文件路径（相对路径或绝对路径）
GSC_CREDENTIALS_PATH=./gsc_credentials.json

# GSC 站点属性，注意域名属性要写 sc-domain:getfastcalc.com
GSC_SITE_URL=https://getfastcalc.com/

# AI 模型（Claude 优先）
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
AI_MODEL=claude-3-5-sonnet-20241022
```

## 3. 运行流程

### 单独运行

```bash
# 获取 GSC 数据
python fetch_gsc_data.py

# AI 分析
python analyze_seo.py
```

### 一键运行

```bash
python run_seo_pipeline.py
```

## 4. 输出说明

- `gsc_optimization_candidates.json`：原始候选页面（URL、展示次数、排名、当前标题/描述）。
- `optimization_suggestions.json`：AI 返回的结构化建议，每个 URL 包含 3 组标题+描述。
- `optimization_suggestions_review.md`：格式化 Markdown，方便你逐条审阅。

## 5. 后续执行建议

1. 先人工审阅 `optimization_suggestions_review.md`。
2. 选择合适的新标题/描述，在对应页面源码中修改 `metaTitle` / `metaDescription`。
3. 改完后重新部署网站，等待 7–14 天再跑一次脚本，验证 CTR 是否提升。

## 6. 为什么这样设计有效

- **分模块**：数据获取、AI 分析、建议输出完全解耦，便于调试和替换模型。
- **人工审阅**：AI 只给建议，最终执行由你确认，避免误伤现有排名。
- **精准打击**：只优化有展示但无点击的 URL，ROI 最高。
- **可扩展**：后续可以加入 `apply_suggestions.py` 自动修改 Next.js 页面元数据，但建议先手动跑通闭环再自动化。
