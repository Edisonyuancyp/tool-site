# 关键词研究系统升级计划

## 1. 现有能力

当前已有关键词研究/工具发现流水线：

| 脚本 | 作用 | 输出 |
|------|------|------|
| `research.py` | 用 SerpAPI 搜索 Reddit/Quora/Google，抓取用户痛点片段 | `research_cache/<category>.json` |
| `ai_generate.py` | 用 LLM 分析片段，生成新工具创意 | `tasks.json` |
| `generate_tool.py` | 把 `tasks.json` 转成 `tools-registry/<slug>/` 目录和占位 `view.tsx` | 工具注册表 |
| `enrich-keywords.mjs` | 用 Google Suggest 给每个工具补长尾关键词 | 更新 `meta.json` |
| `refresh-keywords.py` | 每周批量跑 `enrich-keywords.mjs` | 更新关键词 |

## 2. 主要缺陷

### 2.1 没有搜索量/竞争度数据
- SerpAPI 只返回 snippet，不告诉关键词月搜索量、KD（Keyword Difficulty）。
- 无法判断“哪个工具创意值得优先做”。

### 2.2 没有竞品分析
- 不知道竞争对手（如 calculator.net、omnicalculator.com）在做什么。
- 无法发现“他们做了、我们没做”的缺口。

### 2.3 没有跟现有工具做缺口对比
- 生成新工具前，没有系统对比“已有 141 个工具覆盖了哪些关键词，还有哪些空白”。

### 2.4 没有趋势/季节性数据
- 无法判断某个关键词是 rising 还是 falling。
- 错过季节性流量机会（如 tax season、Black Friday）。

### 2.5 没有自动打分和优先级排序
- 生成 5 个工具创意后，需要人工判断先做哪个。
- 应该自动按“搜索量 × 竞争度 × 相关性”打分。

### 2.6 没有整合进 Agent 自然语言命令
- 用户不能直接在 Telegram 说“研究 finance 类别的关键词”。
- 必须手动跑 3 个脚本。

### 2.7 生成工具后功能仍是占位
- `generate_tool.py` 只生成 stub `view.tsx`，需要再跑 `complete_tool` 才有真实功能。
- 这两个步骤没有自动串联。

## 3. 完美版改进计划

### 3.1 接入搜索量数据源（Phase 1）
- **Ahrefs API**：最准，但贵。
- **SerpAPI 的 Keyword Data API**：可以拿到 volume / CPC / competition。
- **Google Trends API**（免费，通过 pytrends）：判断趋势和季节性。
- **Google Keyword Planner**：官方，但需要 Google Ads 账户。
- **优先实现**：SerpAPI keyword data + Google Trends。

### 3.2 增加竞品分析模块（Phase 1）
- 新增 `competitor_research.py`：
  - 输入：竞争对手域名列表（如 `omnicalculator.com`, `calculator.net`）
  - 用 SerpAPI / Ahrefs 抓他们的 top pages 和关键词
  - 输出 `competitor_gap.json`：对手有排名、我们没有覆盖的关键词/工具

### 3.3 缺口分析（Phase 1）
- 新增 `keyword_gap.py`：
  - 读 `tools-registry/` 所有 `meta.json` 的 keywords
  - 读 `research_cache/` 和 `competitor_gap.json`
  - 输出按“搜索量/竞争度/相关度”排序的缺口列表

### 3.4 自动打分与优先级排序（Phase 2）
- 每个工具创意打分：
  - `score = estimated_volume × (1 - competition) × relevance × trend_factor`
- 生成 `opportunities.json`，按分数排序。
- Agent 可以只返回 top 10 机会。

### 3.5 整合进 Agent（Phase 2）
- 新增 agent function：`research_keywords`
  - 命令：`研究 finance 类别的关键词` / `研究竞争对手 omicalculator.com 的关键词缺口`
  - 行为：
    1. 运行 `research.py --category finance`
    2. 运行 `ai_generate.py --category finance`
    3. 运行 `enrich-keywords.mjs` 给新任务补关键词
    4. 输出 top 10 机会清单
- 新增 agent function：`generate_tool_from_research`
  - 命令：`把研究成果生成 5 个新工具`
  - 行为：
    1. 运行 `generate_tool.py`（或生成单个 slug）
    2. 自动运行 `complete_tool` 补全功能
    3. 运行 `generate_variants.py` 和 `generate-howto-schema.py`
    4. build + push

### 3.6 内容/文章生成（Phase 3）
- 新增 `generate_content.py`：
  - 输入：工具 slug
  - 输出：一篇 800-1500 字的 SEO 文章（如 “How to Calculate BMI”）
  - 保存为 `app/blog/[slug].mdx` 或工具页面的长描述
- 让 Agent 支持：`为 bmi-calculator 生成一篇 SEO 文章`

### 3.7 趋势与季节性监控（Phase 3）
- 每月跑一次 Google Trends 对比：
  - 哪些工具关键词上升最快
  - 哪些下降
- 输出：下个月重点优化的工具清单

## 4. 推荐的最小可行改进（MVP）

如果先做 3 件事，ROI 最高：

1. **把研究流程接入 Agent**（`research_keywords` function）
   - 现在就能用自然语言触发研究。
2. **给研究成果加搜索量/趋势**（SerpAPI keyword data + Google Trends）
   - 让“先做哪个工具”有数据依据。
3. **打通“研究 → 生成工具 → 补全功能 → 发布”全自动化**
   - 用户一句话就能新增一个真实可用的新工具。

## 5. 成功指标

- 每月新增工具数：从手动 5-10 个提升到自动 30-50 个
- 关键词覆盖率：每个工具平均关键词从 5-10 提升到 20+
- 自然流量增长：3 个月内日 UV 从当前 1 提升到 50+
- 人工介入次数：从“每个工具都要手动”降到“只需要审核/确认”

## 6. 下一步行动

建议先实现 **Phase 2 的 Agent 集成**（研究 → 生成工具 → 补全功能），因为这是把现有能力串成一句话命令的关键。之后再逐步加搜索量、竞品分析。
