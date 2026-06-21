# GetFastCalc — 站长开发日志

> 每次修改后必须更新此文件。这是项目的唯一真相来源。

---

## 项目基本信息

| 项目 | 值 |
|---|---|
| 网站 | https://getfastcalc.com |
| GitHub | https://github.com/Edisonyuancyp/tool-site |
| 部署平台 | Netlify（自动从 GitHub main 分支构建） |
| 框架 | Next.js 15，`output: "export"`（纯静态 SSG） |
| 构建输出 | `out/` 目录 |
| Node 版本 | 20 |
| 样式 | TailwindCSS |
| 字体 | Geist (Google Fonts) |
| 分析 | Google Analytics 4 (ID: G-LSG3NFQFWD) |

---

## 目录结构说明

```
app/
  page.tsx                    # 英文首页
  layout.tsx                  # 根 layout，含 WorkbenchProvider + GA4
  sitemap.ts                  # 动态生成 sitemap（586 条 URL）
  robots.txt/                 # robots.txt
  [locale]/
    page.tsx                  # /es 和 /fr 本地化首页
    tools/[slug]/page.tsx     # /es/tools/* 和 /fr/tools/* 多语言工具页
  tools/[slug]/page.tsx       # 英文工具页（含 legacy + registry 两套路由）
  workbench/page.tsx          # /workbench 私有页（noindex）

components/
  Header.tsx                  # 含语言切换器（EN/ES/FR）
  Footer.tsx
  ToolLayout.tsx              # 工具页面布局，含 FavoriteButton + VisitTracker + AccuracyFeedback
  ToolGrid.tsx                # 英文首页工具网格
  LocalizedToolGrid.tsx       # 多语言首页工具网格（链接指向 /locale/tools/slug）
  WorkbenchDashboard.tsx      # 首页迷你工作台（收藏 + 最近访问）
  WorkbenchFull.tsx           # /workbench 完整工作台页面
  FavoriteButton.tsx          # 收藏按钮（使用 WorkbenchContext）
  VisitTracker.tsx            # 无渲染，记录访问到 WorkbenchContext
  AccuracyFeedback.tsx        # 工具准确性反馈按钮
  ShareResultCard.tsx         # 结果分享卡片（含 QR 码，html-to-image）
  ToolRequestBanner.tsx       # 首页工具需求征集 banner
  FavoritesSection.tsx        # 已废弃，被 WorkbenchDashboard 替代

lib/
  registry.ts                 # 工具注册表加载器（读 meta.json）
  i18n-registry.ts            # 多语言注册表加载器（读 meta.es.json / meta.fr.json）
  WorkbenchContext.tsx        # React Context：收藏 + 最近访问（localStorage 持久化）
  tools.ts                    # legacy 工具列表

tools-registry/<slug>/
  meta.json                   # 英文 meta（标题/描述/FAQ/variants）
  meta.es.json                # 西班牙语翻译（由 scripts/translate-metas.mjs 生成）
  meta.fr.json                # 法语翻译
  view.tsx                    # 工具 UI 组件

scripts/
  translate-metas.mjs         # 批量翻译脚本（OpenAI gpt-4o-mini）
  research.py                 # SerpAPI 市场调研脚本
  generate_tool.py            # OpenAI 自动生成新工具脚本

.github/workflows/
  auto-grow.yml               # 每周一自动生成新工具并推送
```

---

## 已实现功能清单

### SEO
- [x] 每个工具独立 `metaTitle` / `metaDescription` / `keywords`
- [x] `sitemap.xml` 动态生成（586 条 URL）
- [x] `robots.txt`
- [x] OpenGraph + Twitter Card meta
- [x] Schema.org 结构化数据（首页）
- [x] `hreflang` 三路互联（en/es/fr）
- [x] Canonical URL 每页独立
- [x] `/workbench` 页面 `noindex`

### 多语言 i18n
- [x] 西班牙语首页 `/es`
- [x] 法语首页 `/fr`
- [x] 西班牙语工具页 `/es/tools/[slug]`（193 个）
- [x] 法语工具页 `/fr/tools/[slug]`（193 个）
- [x] 翻译文件 `meta.es.json` / `meta.fr.json`（53 个工具 × 2）
- [x] Header 语言切换器（🇺🇸/🇪🇸/🇫🇷，智能路径映射）
- [x] Sitemap 包含所有多语言 URL

### 工具系统
- [x] Registry 架构（`tools-registry/<slug>/` 目录）
- [x] 变体路由（如 `mortgage-calculator` → `loan-calculator` + variant）
- [x] 自动生成工具脚本（每周 GitHub Actions）
- [x] Legacy 工具兼容（25+ 个老工具）

### 用户体验 / 留存
- [x] **用户工作台**（`WorkbenchContext`）
  - 收藏工具（localStorage `wb_favs`）
  - 最近访问记录（localStorage `wb_recents`，最多 10 条）
  - 首页 `WorkbenchDashboard` 展示
  - `/workbench` 完整页面
- [x] **准确性反馈**（每个工具页底部）
- [x] **工具需求收集**（首页 Banner，localStorage `tool_requests`）

### 病毒传播 / 分享
- [x] `ShareResultCard` 组件
  - 生成可下载 PNG 结果卡片
  - Twitter / Reddit 一键分享
  - 内嵌 QR 码（链接到工具页，驱动回流）
  - 已集成：loan-calculator、macro-tracker-calculator、savings-goal-calculator

### 技术基础
- [x] `netlify.toml`（`publish = "out"`，Node 20）
- [x] Google Analytics 4 集成
- [x] 纯静态导出（`output: "export"`），零服务器成本

---

## 关键 localStorage Keys

| Key | 用途 |
|---|---|
| `wb_favs` | 收藏工具 slug 列表 |
| `wb_recents` | 最近访问记录（含时间戳） |
| `tool_requests` | 用户提交的工具需求 |
| `fb_<slug>` | 各工具准确性反馈 |

---

## 翻译脚本使用方法

```bash
# 翻译所有工具（跳过已存在的）
node scripts/translate-metas.mjs

# 翻译单个新工具
node scripts/translate-metas.mjs --slug new-tool-slug

# 只翻译某一语言
node scripts/translate-metas.mjs --locale es
```

---

## Sitemap 统计（最后更新：2026-06-21）

| 类型 | 数量 |
|---|---|
| 英文首页 | 1 |
| 多语言首页（/es, /fr） | 2 |
| 英文工具页 + 变体 | ~197 |
| 西班牙语工具页 | ~193 |
| 法语工具页 | ~193 |
| **合计** | **586** |

---

## 待办 / 优化方向

- [ ] 将 ShareResultCard 集成到更多高流量工具（BMI、age-calculator 等）
- [ ] 添加葡萄牙语（/pt）页面（巴西市场大）
- [ ] Google Search Console 提交新 sitemap
- [ ] 监控 Netlify 带宽，考虑迁移到 Cloudflare Pages（无带宽限制）
- [ ] 工具页面添加 FAQ Schema（已有 FAQ 数据，未输出 JSON-LD）

---

## 变更日志

| 日期 | 内容 |
|---|---|
| 2026-06-21 | 添加 AccuracyFeedback、ToolRequestBanner、FavoriteButton、FavoritesSection |
| 2026-06-21 | 添加 ShareResultCard（含 QR 码），集成到 3 个工具页 |
| 2026-06-21 | 实现 i18n：翻译 53 个工具为 es/fr，创建多语言路由 |
| 2026-06-21 | Header 添加语言切换器（EN/ES/FR） |
| 2026-06-21 | 实现 WorkbenchContext（收藏 + 最近访问），/workbench 页面（noindex） |
| 2026-06-21 | 创建 /es 和 /fr 本地化首页 |
| 2026-06-21 | Sitemap 更新至 586 条 URL，添加 netlify.toml 修复 i18n 404 |
