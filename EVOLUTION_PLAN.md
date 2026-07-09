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
| 2026-07-09 | 增加第八章（SEO 外部诊断报告）+ 第九章（优先修复路径） |

---

## 八、SEO 外部诊断报告（2026-07-09）

> 来源：GPT 对 getfastcalc.com 的外部信号分析。

### 8.1 现状判断

- Google **已收录**首页、工具页、多语言页（Macro Tracker、Keyword Density、Developer Tools 等）
- 问题不是"没被收录"，而是**收录了但 Google 不认为值得排前面**
- 处于新站常见阶段：初期被发现 → 部分收录 → 竞争评估后排名回落

### 8.2 最可能的五个下滑原因

#### ① 网站主题太散，新站难建立权威
- 当前覆盖 AI / Ecommerce / Developer / Health / Finance / SEO / Travel / Crypto / Cooking / Quant 等大量方向
- Google 很难判断你是哪方面的权威
- "calculator" 赛道极卷，对手是 Calculator.net / Omni Calculator / NHLBI / CDC / Investor.gov
- **结论**：不能 100 个工具一起冲，要先选一个小领域打穿

#### ② 多语言页面"半翻译"，页面质量信号差
- `/pt/`、`/fr/`、`/es/` 页面标题/简介是目标语言，但输入项、按钮、FAQ、Related Tools 仍是英文
- 半成品多语言页会让 Google 和用户都认为质量不完整
- **结论**：没完整翻译的语言页先 `noindex`，不要让 Google 大量收录半成品

#### ③ 重复/近似重复工具页，权重分散
- 例：`/tools/calc/macro-tracker-calculator/` 与 `/tools/calc/macro-tracker-calculator-for-beginners/` 功能结构几乎相同
- 后果：Google 不知道该排哪一个 → 权重分散 → Search Console 出现"Duplicate, Google chose different canonical"
- **结论**：保留差异明显的，另一个 301 重定向到主页面；或 noindex

#### ④ 分类页太薄，像目录页，不像能排名的内容页
- Date & Time、Developer Tools 等分类页只有标题 + 工具列表，内容极短
- **结论**：分类页可以存在，但真正要排名的是：单工具页 + 强专题页 + 问题型内容页

#### ⑤ 模板化内容味道较重
- 多个工具页使用类似"This calculator runs entirely in your browser — no data is sent to any server…"的固定句式
- Google 强调：内容应提供原创信息、完整说明、超出显而易见的信息
- Google 垃圾政策警告：批量生成多主题内容 + 缺少原创价值 = scaled content abuse 风险
- **结论**：不是一定违规，但要避免"批量生成工具页 + 批量生成解释文案"的外观

### 8.3 应该在哪里诊断

#### Google Search Console（第一优先）

**Performance → Search results**
- 比较：最近 28 天 vs 上一个 28 天
- 看哪些 Query / Page 掉了
- 判断表：

| 现象 | 说明 |
|------|------|
| Impressions 掉 | 索引减少 / 关键词需求下降 / 页面被替代 / 主题权重下降 |
| Position 掉 | 内容质量 / 竞争对手 / 重复页面 / 权威不足 |
| Impressions 没掉但 Clicks 掉 | 标题/描述 CTR 不行，或 SERP 被 AI/广告/精选摘要抢流量 |
| 某一类页面一起掉 | 分类/模板/多语言/内链结构可能有问题 |

**Pages / Indexing（重点查）**
- Crawled - currently not indexed
- Discovered - currently not indexed
- Duplicate, Google chose different canonical
- Alternate page with proper canonical tag
- Soft 404 / Blocked by robots.txt / Excluded by noindex

**URL Inspection（抽查 10 个页面）**
- 英文首页
- 一个英文主力工具页
- 一个 `/es/` 页面
- 一个 `/fr/` 页面
- 一个重复工具页
- 一个分类页

**Experience → Core Web Vitals**
- LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1（移动端）

---

## 九、优先修复执行路径

> 按优先级排序。**先别继续加页面，先收敛质量。**

### 第一步：确定主攻赛道（立即执行）

推荐优先攻：
- **AI Prompt / Token / Cost Tools** ← 需求爆发，竞争相对低
- **Developer Tools** ← 每天被搜索，粘性强

暂缓：Health / Finance（YMYL 领域，Google 对信任和专业性要求极高，新站难突破）

### 第二步：处理重复工具页（本周内）

- [ ] 列出所有功能高度相似的工具对（slug 级别）
- [ ] 保留差异化明显的版本；另一个做 301 重定向或 noindex
- [ ] Sitemap 只保留 canonical 主 URL
- [ ] 在 `_redirects` 文件中补全 301 规则

重点检查对象：
- `macro-tracker-calculator` vs `macro-tracker-calculator-for-beginners`
- 其他"for-beginners"/"advanced"/"free"变体页

### 第三步：noindex 半成品多语言页（本周内）

- [ ] 检查 `/es/` `/fr/` 工具页：按钮、输入项、FAQ、Related Tools 是否完整翻译
- [ ] 未完整翻译的页面：在 meta 中加 `noindex`（或从 sitemap 移除）
- [ ] 只保留质量完整的多语言页参与索引

### 第四步：把 20 个核心工具页做厚（2 周内）

每个主力工具页必须包含：
- [ ] 计算公式/计算逻辑说明
- [ ] 真实使用例子（带具体数字）
- [ ] 结果解释（数字意味着什么）
- [ ] 常见错误 / 使用误区
- [ ] 适用场景 / 限制说明
- [ ] 相关工具内链（3-5 个，只链相关）
- [ ] 最后更新时间
- [ ] FAQ Schema JSON-LD（已有 FAQ 数据，需输出）
- [ ] "这个工具如何计算"的透明说明

优先工具候选：
1. Prompt Token Counter / Prompt Cost Calculator
2. JSON Formatter / Base64 Converter
3. FBA Fee Calculator
4. Keyword Density Checker
5. Reading Time Calculator

### 第五步：优化内链结构（2 周内）

- [ ] 减少全站底部无差别堆砌工具链接
- [ ] 每个工具页只保留 3-5 个**真正相关**的内链
- [ ] 分类页增加引导性文案（场景说明 + 推荐路径），不只是工具列表

### 第六步：持续监控（每两周）

- [ ] Google Search Console Performance：对比 Impressions / Position 变化
- [ ] Pages Indexing：追踪"Crawled - currently not indexed"数量趋势
- [ ] Core Web Vitals：移动端 LCP / INP / CLS

### 修复优先级总结

| 优先级 | 任务 | 时间目标 |
|--------|------|----------|
| 🔴 P0 | 停止批量加页面，收敛到主赛道 | 立即 |
| 🔴 P0 | 处理重复/相似工具页（301 或 noindex） | 本周 |
| 🔴 P0 | noindex 半成品多语言页 | 本周 |
| 🟠 P1 | 20 个核心工具页内容加厚 | 2 周内 |
| 🟠 P1 | FAQ Schema JSON-LD 全面输出 | 2 周内 |
| 🟡 P2 | 内链结构优化（减少无关链接堆砌） | 2 周内 |
| 🟡 P2 | 分类页增加真实内容 | 1 个月内 |
| 🟢 P3 | 核心 Web Vitals 移动端优化 | 持续 |
| 🟢 P3 | 多语言页完整翻译后逐步重新 index | 持续 |
