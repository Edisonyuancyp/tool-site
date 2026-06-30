# GetFastCalc 自动进化计划 (Auto-Growth Plan)

> 基于 `getfastcalcu 建议.rtf` 与 `getfastcalcu seo计划.rtf` 制定。
> 目标：把 GetFastCalc 从「计算器聚合站」升级为 **解决问题的问题+工具 (Problem + Tool) 型网站**，实现长期自动增长。

---

## 一、核心战略

### 1.1 不再做的方向（红海）
- 普通 BMI、百分比、年龄、利率、单位换算等基础计算器
- 这些工具已经极度饱和，难以获得新流量

### 1.2 重点做的方向（蓝海 / 高 ROI）

| 优先级 | 分类 | 理由 | 目标用户 |
|--------|------|------|----------|
| ⭐⭐⭐⭐⭐ | **AI Tools** | 需求爆发，搜索量大，几乎没人做好 | AI 用户、提示词工程师、开发者 |
| ⭐⭐⭐⭐⭐ | **SEO Tools** | 搜索量高，竞争中等，可互相导流 | 站长、内容创作者、SEOer |
| ⭐⭐⭐⭐⭐ | **Developer Tools** | 每天被搜索，粘性强 | 开发者 |
| ⭐⭐⭐⭐⭐ | **Amazon / FBA** | 已有基础，竞争可控 | 亚马逊卖家 |
| ⭐⭐⭐⭐ | **YouTube Creator** | 搜索量高，年轻用户多 | YouTuber |
| ⭐⭐⭐⭐ | **Shopify** | 竞争不高，电商相关 | 独立站卖家 |
| ⭐⭐⭐ | **Pinterest / 社媒 / 广告 / 游戏** | 容易拿 SEO，长尾流量稳 | 创作者、营销人 |

### 1.3 内容策略：问题 + 工具

不单独写「Top 10 AI Tools」这类排行榜文章。
改为：

1. 找到一个真实搜索问题（例如 "How many tokens is 10,000 words?"）
2. 做一个解决该问题的工具（例如 Token Counter）
3. 写一篇解释该问题的内容页（概念、示例、FAQ）
4. 在工具页和内容页之间互相链接
5. 衍生 5~10 个相关变体页面 / 长尾关键词页

这种模式比单纯博客文章更有价值：
- 用户停留时间更长
- 更容易被 Google 收录和排名
- 与工具页形成内容矩阵
- 可被 AI 搜索引用

---

## 二、自动进化执行日历

GitHub Actions `.github/workflows/auto-grow.yml` 每天 02:00 UTC 运行。

| 星期 | 模式 | 任务 |
|------|------|------|
| **周一** | `new-tool` | 生成 **AI Tools**（5 个） |
| **周二** | `content` | 为最新 AI/SEO 工具生成「问题+工具」内容页 |
| **周三** | `new-tool` | 生成 **SEO Tools**（5 个） |
| **周四** | `seo-geo` | 刷新 `llms.txt` + 关键词 + 内容变体 |
| **周五** | `new-tool` | 生成 **Developer / Amazon / YouTube** 等（5 个） |
| **周六** | `keywords` | Google Suggest 关键词刷新 + 变体页生成 |
| **周日** | `maintenance` | 修复损坏工具 + 生成变体 + 程序化 SEO + 深度思考诊断 |

### 周日深度思考（Deep Review）
每周日额外执行：
1. 分析现有工具中哪些流量低 / 重复 / 无意义
2. 检查工具是否真正解决了问题（有没有清晰输入、输出、解释）
3. 为高潜力工具补充变体页、FAQ、示例
4. 删除或合并低质量工具（暂不自动删除，只生成建议报告）

---

## 三、首批工具清单（AI Tools 优先）

### AI Tools 分类（新分类）
- `Prompt Token Counter`
- `Prompt Cost Calculator`
- `AI Image Cost Calculator`
- `AI Video Cost Calculator`
- `Token Splitter / Context Window Calculator`
- `AI Model Compare`
- `Prompt Formatter`
- `Prompt Cleaner`
- `Prompt Variable Generator`
- `Prompt Version Compare`

### SEO Tools 分类
- `Title Generator`
- `Meta Description Generator`
- `Slug Generator`
- `Robots.txt Generator`
- `Schema Generator`
- `Canonical Checker`
- `OpenGraph Preview`
- `Twitter Card Preview`
- `Keyword Density Checker`
- `Reading Time Calculator`

### 内容 / 社媒工具
- `Twitter / X Character Counter`
- `TikTok Caption Counter`
- `Instagram Caption Counter`
- `YouTube Description Counter`
- `LinkedIn Post Counter`
- `Reddit Character Counter`

### 文件 / 开发者工具
- `JSON Beautifier`
- `XML Formatter`
- `CSV Cleaner`
- `Duplicate Line Remover`
- `Regex Tester`
- `Markdown Preview`
- `HTML Escape`
- `YAML Validator`

### 图片工具
- `Image Compressor`
- `Image Cropper`
- `Aspect Ratio Calculator`
- `Image Size Calculator`
- `Transparent PNG Checker`
- `WebP Converter`
- `Image DPI Checker`
- `Base64 Image Converter`

---

## 四、内容页结构标准

每个「问题+工具」内容页必须包含：

1. **H1**：直接回答搜索问题
2. **简短答案**：1-2 句话给出核心结论
3. **工具入口**：嵌入对应工具或链接到工具页
4. **详细解释**：概念、公式、示例
5. **常见问答**：5-10 个 FAQ
6. **相关工具推荐**：3-5 个内链
7. **Schema.org Article / FAQPage JSON-LD**

页面路径示例：
- `/blog/how-many-tokens-in-10000-words`
- `/blog/gpt-vs-claude-cost-comparison`
- `/blog/how-to-reduce-openai-api-cost`

---

## 五、技术实现清单

- [x] 在 `lib/tools.ts` 增加 `AI` 分类 URL 前缀
- [x] 更新 `auto-grow.yml` 增加 AI/SEO/YouTube/社媒/文件/图片等模式
- [x] 更新 `research.py` 增加 AI 工具研究查询模板
- [x] 更新 `ai_generate.py` 增加 AI 工具生成提示词
- [x] 创建 `scripts/generate-problem-tool-content.py` 生成问题+工具内容页
- [x] 周日 maintenance 增加「深度思考诊断」步骤
- [ ] 后续：实现自动生成 PDF / Share Image 报告功能（Calculator + Generator）
- [ ] 后续：根据 Search Console 数据自动优化低 CTR 页面标题和描述

---

## 六、成功指标

- 每月新增工具数：15-20 个
- 每月新增内容页：30-50 个
- 3 个月后 AI Tools 分类流量占比 > 15%
- 6 个月后「问题+工具」内容页流量占比 > 25%
- 网站整体自然搜索曝光量增长 > 50%

---

## 七、更新记录

| 日期 | 内容 |
|------|------|
| 2026-06-30 | 基于用户建议创建本计划，接入 auto-grow workflow |
