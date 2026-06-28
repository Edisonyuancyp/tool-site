/**
 * Batch generate meta.zh.json for all tools that have meta.es.json
 * Translates from English meta.json into Chinese.
 * Run: node scripts/gen-zh-translations.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY = path.join(ROOT, "tools-registry");

// ── Category name translations ───────────────────────────────────────────────
const CAT_ZH = {
  "Health": "健康",
  "Finance": "金融",
  "Math": "数学",
  "Quant": "量化",
  "Design": "设计",
  "Developer": "开发",
  "Dev": "开发",
  "Utilities": "工具",
  "Date & Time": "日期时间",
  "Converter": "转换",
  "Cooking": "烹饪",
  "Lifestyle": "生活",
  "Fitness": "健身",
  "Text": "文字",
  "Security": "安全",
  "Generators": "生成器",
  "Travel": "旅行",
  "Productivity": "效率",
  "ecommerce": "电商",
  "Ecommerce": "电商",
  "Content": "内容",
  "Crypto": "加密",
};

// ── Per-tool Chinese translations ─────────────────────────────────────────────
// Format: slug → { name, tagline, metaTitle, metaDesc, keywords[], faqs[], variants[] }
const ZH = {
  "age-calculator": {
    name: "年龄计算器",
    tagline: "即时计算您的精确年龄",
    metaTitle: "年龄计算器 – 在线免费精确年龄计算",
    metaDesc: "输入出生日期，立即获得精确到天的年龄。免费、无需注册，浏览器直接运行。",
    keywords: ["年龄计算器", "年龄计算", "出生日期计算器", "我多大了", "计算年龄"],
    faqs: [
      { q: "如何计算年龄？", a: "输入出生日期，计算器会自动算出今天与生日之间的年、月、日差值。" },
      { q: "计算结果准确吗？", a: "是的，精确到天，包含闰年处理。" },
    ],
    variants: [
      { variantSlug: "age-calculator-by-birthday", metaTitle: "按生日计算年龄 – 在线年龄计算器", metaDesc: "通过生日计算精确年龄，支持年月日显示。" },
    ],
  },
  "bmi-calculator": {
    name: "BMI 计算器",
    tagline: "即时计算您的身体质量指数",
    metaTitle: "BMI 计算器 – 免费在线体质指数计算",
    metaDesc: "输入身高和体重，立即获得 BMI 值及体重分类（偏轻/正常/超重/肥胖）。免费，无需注册。",
    keywords: ["BMI计算器", "体质指数计算", "身体质量指数", "BMI计算", "在线BMI"],
    faqs: [
      { q: "BMI 是什么？", a: "BMI（身体质量指数）= 体重(kg) ÷ 身高(m)²，用于评估体重是否健康。" },
      { q: "正常 BMI 范围是多少？", a: "18.5–24.9 为正常，低于 18.5 为偏轻，25–29.9 为超重，30 以上为肥胖。" },
      { q: "BMI 对所有人都准确吗？", a: "BMI 是筛查工具，不直接测量体脂。对运动员或老年人可能不够准确。" },
    ],
    variants: [
      { variantSlug: "bmi-calculator-for-women", metaTitle: "女性 BMI 计算器", metaDesc: "专为女性设计的 BMI 计算器，参考女性体脂标准解读结果。" },
      { variantSlug: "bmi-calculator-imperial", metaTitle: "英制 BMI 计算器（磅/英尺）", metaDesc: "使用磅和英尺/英寸计算 BMI，无需单位换算。" },
      { variantSlug: "bmi-calculator-for-kids", metaTitle: "儿童 BMI 计算器", metaDesc: "适用于 2–19 岁儿童的 BMI 计算器，基于 CDC 生长曲线百分位数解读。" },
    ],
  },
  "compound-interest-calculator": {
    name: "复利计算器",
    tagline: "计算投资的复利增长",
    metaTitle: "复利计算器 – 在线免费复利计算",
    metaDesc: "输入本金、利率、期限和复利频率，立即计算最终金额和利息收益。",
    keywords: ["复利计算器", "复利计算", "投资收益计算器", "复息计算", "理财计算器"],
    faqs: [
      { q: "什么是复利？", a: "复利是指利息也产生利息，本金和之前的利息一起产生新的收益。" },
      { q: "复利频率越高越好吗？", a: "是的，复利越频繁（日复利 > 月复利 > 年复利），最终金额越多。" },
    ],
    variants: [],
  },
  "loan-calculator": {
    name: "贷款计算器",
    tagline: "计算每月还款额和总利息",
    metaTitle: "贷款计算器 – 免费在线月供计算",
    metaDesc: "输入贷款金额、利率和期限，立即获得每月还款额、总利息和还款计划表。",
    keywords: ["贷款计算器", "月供计算器", "房贷计算器", "车贷计算器", "还款计算"],
    faqs: [
      { q: "如何计算月供？", a: "月供 = 本金 × 月利率 × (1+月利率)^期数 ÷ ((1+月利率)^期数 - 1)。" },
      { q: "提前还款划算吗？", a: "通常划算，提前还款可以减少总利息支出，但要确认是否有提前还款罚款。" },
    ],
    variants: [],
  },
  "currency-converter": {
    name: "货币转换器",
    tagline: "实时汇率换算",
    metaTitle: "货币转换器 – 在线实时汇率计算",
    metaDesc: "支持 150+ 种货币的实时汇率换算。人民币、美元、欧元、日元等一键转换。",
    keywords: ["货币转换器", "汇率计算器", "外汇换算", "人民币换算", "在线汇率"],
    faqs: [
      { q: "汇率实时更新吗？", a: "是的，汇率数据来自公开 API，每日更新。" },
      { q: "支持哪些货币？", a: "支持 150+ 种主要货币，包括人民币(CNY)、美元(USD)、欧元(EUR)等。" },
    ],
    variants: [],
  },
  "tip-calculator": {
    name: "小费计算器",
    tagline: "快速计算餐厅小费和账单分摊",
    metaTitle: "小费计算器 – 在线免费小费计算",
    metaDesc: "输入账单金额和小费比例，自动计算小费和人均分摊金额。",
    keywords: ["小费计算器", "账单计算器", "餐厅小费", "AA计算器", "分摊计算"],
    faqs: [
      { q: "一般给多少小费？", a: "在美国，通常给账单金额的 15–20%。服务满意可给 20%+。" },
      { q: "多人用餐如何分摊？", a: "输入人数，计算器会自动平均分摊总金额（含小费）。" },
    ],
    variants: [],
  },
  "percentage-calculator": {
    name: "百分比计算器",
    tagline: "快速计算百分比、增减幅度",
    metaTitle: "百分比计算器 – 在线免费百分比计算",
    metaDesc: "计算百分比、百分比增减、某数是另一数的百分之几等多种百分比问题。",
    keywords: ["百分比计算器", "百分比计算", "涨幅计算器", "折扣计算器", "比例计算"],
    faqs: [
      { q: "如何计算百分比？", a: "百分比 = (部分 ÷ 总量) × 100%。" },
      { q: "如何计算涨幅？", a: "涨幅 = (新值 - 旧值) ÷ 旧值 × 100%。" },
    ],
    variants: [],
  },
  "password-generator": {
    name: "密码生成器",
    tagline: "生成安全的随机密码",
    metaTitle: "密码生成器 – 免费在线随机密码生成",
    metaDesc: "生成强随机密码，支持自定义长度、大小写字母、数字和特殊符号。100% 本地运行，密码不上传。",
    keywords: ["密码生成器", "随机密码生成", "强密码生成器", "安全密码", "密码创建工具"],
    faqs: [
      { q: "密码会被保存吗？", a: "不会。所有密码生成完全在浏览器本地完成，不上传任何数据。" },
      { q: "密码长度建议多少？", a: "建议至少 16 位，使用大小写字母、数字和特殊符号的组合。" },
    ],
    variants: [],
  },
  "qr-code-generator": {
    name: "二维码生成器",
    tagline: "快速生成任意内容的二维码",
    metaTitle: "二维码生成器 – 免费在线 QR Code 制作",
    metaDesc: "输入文字、网址或联系信息，即时生成可下载的二维码。免费，无需注册。",
    keywords: ["二维码生成器", "QR码生成", "QR code生成器", "在线二维码", "免费二维码"],
    faqs: [
      { q: "二维码可以存储什么？", a: "可以存储网址、纯文本、联系信息、WiFi 密码等各种内容。" },
      { q: "生成的二维码可以下载吗？", a: "可以，支持下载为 PNG 格式图片。" },
    ],
    variants: [],
  },
  "word-counter": {
    name: "字数统计器",
    tagline: "统计文字数量、字符数和阅读时间",
    metaTitle: "字数统计器 – 在线免费字数/字符计数",
    metaDesc: "粘贴文本即可统计单词数、字符数、句子数和预计阅读时间。免费，实时统计。",
    keywords: ["字数统计器", "字符计数", "在线字数统计", "单词计数", "文字统计工具"],
    faqs: [
      { q: "字数统计支持中文吗？", a: "支持，可统计中文字符数量。" },
      { q: "阅读时间如何计算？", a: "基于平均每分钟阅读 200–250 个单词（英文）估算。" },
    ],
    variants: [],
  },
  "tax-calculator": {
    name: "税务计算器",
    tagline: "快速估算应缴税款",
    metaTitle: "税务计算器 – 在线免费税率计算",
    metaDesc: "输入收入和税率，快速估算应缴税额和税后收入。支持多种税率结构。",
    keywords: ["税务计算器", "所得税计算器", "税率计算", "应缴税计算", "税后收入"],
    faqs: [
      { q: "这个计算器适用于哪个国家？", a: "提供通用税率计算框架，适用于各国个人所得税估算。" },
      { q: "计算结果精确吗？", a: "提供估算值，精确税务申报请咨询专业税务顾问。" },
    ],
    variants: [],
  },
  "savings-goal-calculator": {
    name: "储蓄目标计算器",
    tagline: "计算达到储蓄目标所需时间",
    metaTitle: "储蓄目标计算器 – 理财目标规划工具",
    metaDesc: "输入目标金额、当前储蓄和月存款，计算达成目标需要多长时间。",
    keywords: ["储蓄目标计算器", "存钱计划", "理财目标", "储蓄计划", "攒钱计算器"],
    faqs: [
      { q: "如何更快达到储蓄目标？", a: "增加月储蓄额或提高投资收益率，两者都能缩短达到目标的时间。" },
    ],
    variants: [],
  },
  "retirement-savings-calculator": {
    name: "退休储蓄计算器",
    tagline: "规划退休资金，测算是否够用",
    metaTitle: "退休储蓄计算器 – 退休规划工具",
    metaDesc: "输入年龄、储蓄额和预期支出，计算退休资金是否足够，需要每月存多少。",
    keywords: ["退休储蓄计算器", "退休规划", "养老金计算", "退休金计算器", "养老规划"],
    faqs: [
      { q: "退休需要存多少钱？", a: "常见建议是退休前年收入的 25 倍（4% 提取率规则）。" },
    ],
    variants: [],
  },
  "investment-return-calculator": {
    name: "投资回报计算器",
    tagline: "计算投资的年化收益率和总回报",
    metaTitle: "投资回报计算器 – 在线 ROI 计算",
    metaDesc: "输入初始投资、最终价值和持有期限，计算年化收益率（CAGR）和总回报。",
    keywords: ["投资回报计算器", "ROI计算器", "年化收益率计算", "CAGR计算器", "投资收益"],
    faqs: [
      { q: "什么是 CAGR？", a: "CAGR（复合年增长率）是投资在一段时间内每年平均增长的速率。" },
    ],
    variants: [],
  },
  "debt-repayment-calculator": {
    name: "债务还清计算器",
    tagline: "计算还清债务所需时间和利息",
    metaTitle: "债务还清计算器 – 免费还款计划工具",
    metaDesc: "输入债务余额、利率和月还款额，计算还清时间和总利息支出。",
    keywords: ["债务还清计算器", "还款计划", "信用卡还款计算", "债务计算器", "还款利息计算"],
    faqs: [
      { q: "雪球法和雪崩法哪个更好？", a: "雪崩法（先还高利率债务）省利息最多；雪球法（先还小额债务）心理激励更强。" },
    ],
    variants: [],
  },
  "budget-calculator": {
    name: "预算计算器",
    tagline: "制定月度预算，追踪收支平衡",
    metaTitle: "预算计算器 – 免费在线月度预算规划",
    metaDesc: "输入收入和各项支出，计算月度结余，帮助制定合理预算计划。",
    keywords: ["预算计算器", "月度预算", "家庭预算", "收支计算器", "理财预算工具"],
    faqs: [
      { q: "50/30/20 预算法则是什么？", a: "50% 用于必需支出，30% 用于个人消费，20% 用于储蓄和还债。" },
    ],
    variants: [],
  },
  "car-lease-calculator": {
    name: "汽车租赁计算器",
    tagline: "计算汽车租赁月供和总费用",
    metaTitle: "汽车租赁计算器 – 在线租车费用计算",
    metaDesc: "输入车辆价格、残值、利率和租期，计算每月租赁费用。",
    keywords: ["汽车租赁计算器", "租车月供计算", "车辆租赁费用", "汽车融资计算", "lease计算器"],
    faqs: [
      { q: "租赁和购车哪个更划算？", a: "租赁月供低但没有产权；购车长期更划算。取决于使用年限和里程需求。" },
    ],
    variants: [],
  },
  "finance-charge-calculator": {
    name: "金融费用计算器",
    tagline: "计算信用卡或贷款的金融费用",
    metaTitle: "金融费用计算器 – 利息费用计算工具",
    metaDesc: "计算信用卡余额或贷款的月度金融费用和 APR 利息。",
    keywords: ["金融费用计算器", "信用卡利息计算", "APR计算器", "利息费用计算", "月息计算"],
    faqs: [
      { q: "金融费用如何计算？", a: "金融费用 = 日均余额 × 日利率 × 天数。" },
    ],
    variants: [],
  },
  "macro-tracker-calculator": {
    name: "营养素追踪计算器",
    tagline: "计算每日蛋白质、脂肪、碳水摄入量",
    metaTitle: "营养素追踪计算器 – 宏量营养素计算工具",
    metaDesc: "根据体重目标和活动量，计算每日卡路里及三大营养素（蛋白质/脂肪/碳水化合物）配比。",
    keywords: ["营养素计算器", "宏量营养素", "蛋白质计算器", "减脂饮食计算", "增肌饮食计算"],
    faqs: [
      { q: "宏量营养素是什么？", a: "三大宏量营养素：蛋白质（4kcal/g）、碳水化合物（4kcal/g）、脂肪（9kcal/g）。" },
    ],
    variants: [],
  },
  "bmr-tdee-calculator": {
    name: "基础代谢率计算器",
    tagline: "计算 BMR 和每日总能量消耗 TDEE",
    metaTitle: "BMR/TDEE 计算器 – 基础代谢率与热量需求计算",
    metaDesc: "计算基础代谢率（BMR）和总能量消耗（TDEE），帮助制定减肥或增肌饮食计划。",
    keywords: ["BMR计算器", "TDEE计算器", "基础代谢率计算", "每日热量需求", "卡路里计算器"],
    faqs: [
      { q: "BMR 和 TDEE 的区别？", a: "BMR 是完全静止状态的热量消耗；TDEE = BMR × 活动系数，是实际每日总消耗。" },
    ],
    variants: [],
  },
  "body-fat-calculator": {
    name: "体脂率计算器",
    tagline: "估算身体脂肪百分比",
    metaTitle: "体脂率计算器 – 在线免费体脂百分比计算",
    metaDesc: "通过身体围度（颈围、腰围、臀围）估算体脂率，支持男女不同计算公式。",
    keywords: ["体脂率计算器", "体脂百分比计算", "体脂计算器", "身体脂肪率", "体脂测量"],
    faqs: [
      { q: "健康的体脂率是多少？", a: "男性：15–20% 为健康范围；女性：20–25% 为健康范围。" },
    ],
    variants: [],
  },
  "ideal-weight-calculator": {
    name: "理想体重计算器",
    tagline: "计算基于身高的理想体重范围",
    metaTitle: "理想体重计算器 – 健康体重范围计算",
    metaDesc: "根据身高和性别，使用多种公式计算理想体重范围，包括 BMI 法和 Devine 公式。",
    keywords: ["理想体重计算器", "标准体重计算", "健康体重范围", "理想体重公式", "减肥目标体重"],
    faqs: [
      { q: "理想体重的计算方法？", a: "常用方法包括 BMI 法（正常 BMI 对应的体重范围）和 Devine 公式（基于身高的线性公式）。" },
    ],
    variants: [],
  },
  "water-intake-calculator": {
    name: "每日饮水量计算器",
    tagline: "计算每天应该喝多少水",
    metaTitle: "每日饮水量计算器 – 喝水量计算工具",
    metaDesc: "根据体重、活动量和气候，计算每日建议饮水量，保持最佳水合状态。",
    keywords: ["饮水量计算器", "每日喝水量", "水分需求计算", "喝水计算器", "水合计算器"],
    faqs: [
      { q: "每天应该喝多少水？", a: "一般建议每天 2–3 升，具体取决于体重、活动量和气温。每公斤体重约 35ml。" },
    ],
    variants: [],
  },
  "sleep-calculator": {
    name: "睡眠计算器",
    tagline: "计算最佳起床时间或入睡时间",
    metaTitle: "睡眠计算器 – 睡眠周期计算工具",
    metaDesc: "输入目标起床时间，计算基于 90 分钟睡眠周期的最佳入睡时间；或输入入睡时间，推算最佳起床时间。",
    keywords: ["睡眠计算器", "睡眠周期计算", "最佳起床时间", "入睡时间计算", "睡眠质量工具"],
    faqs: [
      { q: "睡眠周期是多长？", a: "一个完整的睡眠周期约 90 分钟，包含浅睡、深睡和 REM 阶段。" },
      { q: "每晚应该睡多少小时？", a: "成人建议 7–9 小时，即 5–6 个完整睡眠周期。" },
    ],
    variants: [],
  },
  "ovulation-calculator": {
    name: "排卵期计算器",
    tagline: "预测排卵日期和易孕期",
    metaTitle: "排卵期计算器 – 在线免费排卵日预测",
    metaDesc: "输入末次月经日期和周期长度，计算预计排卵日和最佳受孕窗口期。",
    keywords: ["排卵期计算器", "排卵日计算", "易孕期计算器", "安全期计算", "备孕计算器"],
    faqs: [
      { q: "排卵期一般在什么时候？", a: "对于 28 天周期，通常在第 14 天前后排卵。排卵前后 3 天为易孕期。" },
    ],
    variants: [],
  },
  "running-pace-calculator": {
    name: "跑步配速计算器",
    tagline: "计算跑步配速、速度和完赛时间",
    metaTitle: "跑步配速计算器 – 马拉松配速计算工具",
    metaDesc: "输入距离和时间，计算每公里配速；或输入配速，预测完赛时间。支持 5K、10K、半马、全马。",
    keywords: ["跑步配速计算器", "马拉松配速", "配速计算器", "跑步速度计算", "完赛时间计算"],
    faqs: [
      { q: "什么是配速？", a: "配速是跑完每公里（或每英里）所需的时间，单位为 分钟/公里（min/km）。" },
    ],
    variants: [],
  },
  "fitness-age-calculator": {
    name: "健身年龄计算器",
    tagline: "测算您的生理年龄和健康状态",
    metaTitle: "健身年龄计算器 – 生理年龄测评工具",
    metaDesc: "通过心率、BMI、体力活动等指标估算您的生理年龄，了解身体实际健康状态。",
    keywords: ["健身年龄计算器", "生理年龄测试", "健康年龄计算", "体能年龄", "身体年龄测评"],
    faqs: [
      { q: "生理年龄和实际年龄有什么不同？", a: "生理年龄反映身体机能状态，规律运动的人生理年龄往往低于实际年龄。" },
    ],
    variants: [],
  },
  "fitness-level-quiz": {
    name: "健身水平测评",
    tagline: "评估您当前的健身水平",
    metaTitle: "健身水平测评 – 在线体能评估工具",
    metaDesc: "通过简短问卷评估您的健身水平，获得个性化的训练建议。",
    keywords: ["健身水平测评", "体能评估", "健身评估工具", "运动水平测试", "健身建议"],
    faqs: [],
    variants: [],
  },
  "hydration-needs-calculator": {
    name: "水分需求计算器",
    tagline: "根据运动和气候计算水分需求",
    metaTitle: "水分需求计算器 – 运动补水量计算",
    metaDesc: "根据体重、运动强度和气温，精准计算运动前中后的水分补充需求。",
    keywords: ["水分需求计算器", "运动补水计算", "水分补充计划", "脱水预防", "运动饮水量"],
    faqs: [],
    variants: [],
  },
  "gpa-calculator": {
    name: "GPA 计算器",
    tagline: "计算学业绩点平均值",
    metaTitle: "GPA 计算器 – 在线免费绩点计算",
    metaDesc: "输入课程学分和成绩，自动计算加权 GPA。支持 4.0 制和百分制转换。",
    keywords: ["GPA计算器", "绩点计算器", "学业成绩计算", "加权GPA", "成绩计算器"],
    faqs: [
      { q: "什么是 GPA？", a: "GPA（Grade Point Average）是学业绩点平均值，4.0 制中满分为 4.0。" },
    ],
    variants: [],
  },
  "group-trip-cost-splitter": {
    name: "团体旅行费用分摊器",
    tagline: "公平分摊团队旅行开销",
    metaTitle: "旅行费用分摊器 – AA 制旅游费用计算",
    metaDesc: "输入各项团体旅行费用和人员，自动计算每人应付金额和转账方向。",
    keywords: ["旅行费用分摊", "AA费用计算", "团体旅行计算器", "旅游AA制", "分摊账单工具"],
    faqs: [],
    variants: [],
  },
  "holiday-calculator": {
    name: "节假日计算器",
    tagline: "查询法定节假日和工作日数量",
    metaTitle: "节假日计算器 – 节假日查询工具",
    metaDesc: "计算两个日期之间的工作日、周末和节假日天数。",
    keywords: ["节假日计算器", "工作日计算", "节假日查询", "假期天数计算", "日期计算器"],
    faqs: [],
    variants: [],
  },
  "travel-expense-estimator": {
    name: "旅行费用估算器",
    tagline: "估算旅行总预算和人均费用",
    metaTitle: "旅行费用估算器 – 旅游预算计算工具",
    metaDesc: "输入交通、住宿、餐饮和景点费用，估算旅行总预算和人均费用。",
    keywords: ["旅行费用估算", "旅游预算计算器", "旅行预算工具", "出行费用计算", "旅行花费估算"],
    faqs: [],
    variants: [],
  },
  "travel-time-calculator": {
    name: "行程时间计算器",
    tagline: "估算旅行距离和时间",
    metaTitle: "行程时间计算器 – 驾车时间估算工具",
    metaDesc: "输入距离和速度，计算预计行驶时间；或输入出发和到达时间计算行驶速度。",
    keywords: ["行程时间计算器", "驾车时间计算", "旅行时间估算", "速度距离时间计算", "公路行程计算"],
    faqs: [],
    variants: [],
  },
  "carbon-footprint-travel-calculator": {
    name: "旅行碳足迹计算器",
    tagline: "估算旅行的碳排放量",
    metaTitle: "旅行碳足迹计算器 – 碳排放估算工具",
    metaDesc: "计算飞机、汽车或火车旅行的碳排放量，了解旅行的环境影响。",
    keywords: ["碳足迹计算器", "旅行碳排放", "飞行碳排放计算", "环保旅行", "碳排量计算"],
    faqs: [],
    variants: [],
  },
  "task-priority-calculator": {
    name: "任务优先级计算器",
    tagline: "使用艾森豪威尔矩阵排列任务优先级",
    metaTitle: "任务优先级计算器 – 时间管理工具",
    metaDesc: "通过紧急性和重要性对任务进行评分，生成优先处理顺序，提升工作效率。",
    keywords: ["任务优先级", "时间管理工具", "艾森豪威尔矩阵", "工作效率计算器", "待办事项排序"],
    faqs: [],
    variants: [],
  },
  "time-blocking-scheduler": {
    name: "时间块规划器",
    tagline: "规划每日时间块，提升专注效率",
    metaTitle: "时间块规划器 – 每日时间管理工具",
    metaDesc: "通过时间块规划法安排每日任务，减少干扰，提升深度工作效率。",
    keywords: ["时间块规划", "时间管理", "深度工作计划", "每日计划工具", "效率提升工具"],
    faqs: [],
    variants: [],
  },
  "daily-goal-tracker": {
    name: "每日目标追踪器",
    tagline: "设定并追踪每日目标完成情况",
    metaTitle: "每日目标追踪器 – 目标完成度追踪工具",
    metaDesc: "设定每日目标，记录完成进度，建立良好习惯和执行力。",
    keywords: ["每日目标追踪", "目标管理工具", "习惯追踪器", "每日计划完成", "目标达成计算"],
    faqs: [],
    variants: [],
  },
  "work-life-balance-calculator": {
    name: "工作生活平衡计算器",
    tagline: "评估您的工作与生活平衡状态",
    metaTitle: "工作生活平衡计算器 – 健康生活评估工具",
    metaDesc: "通过问卷评估您的工作生活平衡状况，获得改善建议。",
    keywords: ["工作生活平衡", "生活质量评估", "工作压力计算器", "健康生活指数", "职场健康评估"],
    faqs: [],
    variants: [],
  },
  "serving-size-calculator": {
    name: "份量计算器",
    tagline: "计算食物份量和营养摄入",
    metaTitle: "份量计算器 – 食物分量计算工具",
    metaDesc: "根据人数和食谱，计算食材用量和每份营养成分。",
    keywords: ["份量计算器", "食物分量计算", "烹饪份量工具", "食材用量计算", "营养份量"],
    faqs: [],
    variants: [],
  },
  "cooking-time-calculator": {
    name: "烹饪时间计算器",
    tagline: "根据食材重量计算烹饪时间",
    metaTitle: "烹饪时间计算器 – 烤肉/烹饪时长计算工具",
    metaDesc: "输入食材重量和种类，计算推荐烹饪时间和温度，确保食物安全熟透。",
    keywords: ["烹饪时间计算器", "烤肉时间计算", "食物烹饪时长", "烹饪温度计算", "烘焙时间计算"],
    faqs: [],
    variants: [],
  },
  "ingredient-substitution-calculator": {
    name: "食材替换计算器",
    tagline: "找到食谱中缺少食材的替代品",
    metaTitle: "食材替换计算器 – 烹饪食材替代工具",
    metaDesc: "输入缺少的食材，获得可用于替换的替代品及比例建议。",
    keywords: ["食材替换", "烹饪替代品", "食材替代计算", "缺少食材怎么替换", "烹饪替换工具"],
    faqs: [],
    variants: [],
  },
  "leftover-recipe-generator": {
    name: "剩菜食谱生成器",
    tagline: "根据剩余食材生成新菜谱",
    metaTitle: "剩菜食谱生成器 – 剩余食材菜谱工具",
    metaDesc: "输入冰箱里的剩余食材，获得可以烹饪的菜谱建议，减少食物浪费。",
    keywords: ["剩菜食谱", "剩余食材菜谱", "减少食物浪费", "食材菜谱生成", "剩饭菜创意"],
    faqs: [],
    variants: [],
  },
  "diff-checker": {
    name: "文本差异对比工具",
    tagline: "快速找出两段文本的差异",
    metaTitle: "文本差异对比工具 – 在线文本比较器",
    metaDesc: "粘贴两段文本，高亮显示新增、删除和修改的部分。适用于代码审查、文档对比。",
    keywords: ["文本对比工具", "文本差异比较", "diff工具", "代码对比器", "文档差异查找"],
    faqs: [],
    variants: [],
  },
  "base64-tool": {
    name: "Base64 编码/解码工具",
    tagline: "在线 Base64 编码与解码",
    metaTitle: "Base64 编码解码工具 – 在线免费转换",
    metaDesc: "输入文本即可进行 Base64 编码或解码，支持文件和图片的 Base64 转换。",
    keywords: ["Base64编码", "Base64解码", "Base64转换工具", "在线Base64", "编码解码工具"],
    faqs: [],
    variants: [],
  },
  "base-converter": {
    name: "进制转换器",
    tagline: "二进制、八进制、十进制、十六进制互转",
    metaTitle: "进制转换器 – 在线二进制十六进制转换",
    metaDesc: "支持 2–64 进制互转，包括二进制、八进制、十进制、十六进制、Base58 等。",
    keywords: ["进制转换器", "二进制转换", "十六进制转换", "八进制计算器", "数制转换工具"],
    faqs: [],
    variants: [],
  },
  "json-csv-formatter": {
    name: "JSON/CSV 格式化工具",
    tagline: "格式化、验证和转换 JSON 与 CSV",
    metaTitle: "JSON CSV 格式化工具 – 在线免费数据格式转换",
    metaDesc: "粘贴 JSON 或 CSV 数据，自动格式化、验证语法，并支持 JSON ↔ CSV 互转。",
    keywords: ["JSON格式化", "CSV转换工具", "JSON验证器", "JSON美化器", "数据格式转换"],
    faqs: [],
    variants: [],
  },
  "unix-timestamp-converter": {
    name: "Unix 时间戳转换器",
    tagline: "Unix 时间戳与可读日期时间互转",
    metaTitle: "Unix 时间戳转换器 – 在线时间戳转日期",
    metaDesc: "输入 Unix 时间戳转换为可读日期时间，或输入日期时间转换为时间戳。支持毫秒和秒。",
    keywords: ["Unix时间戳转换", "时间戳转日期", "时间戳计算器", "epoch时间转换", "时间戳工具"],
    faqs: [],
    variants: [],
  },
  "text-case-converter": {
    name: "文字大小写转换器",
    tagline: "在线转换文本大小写格式",
    metaTitle: "文字大小写转换器 – 在线文本格式转换",
    metaDesc: "一键转换文本为大写、小写、标题格式、驼峰命名等多种格式。",
    keywords: ["大小写转换器", "文本格式转换", "驼峰命名转换", "标题格式化", "文字转换工具"],
    faqs: [],
    variants: [],
  },
  "random-number-generator": {
    name: "随机数生成器",
    tagline: "生成指定范围内的随机整数",
    metaTitle: "随机数生成器 – 在线免费随机数生成",
    metaDesc: "设置最小值和最大值，生成随机整数。支持批量生成和排除重复。",
    keywords: ["随机数生成器", "随机数工具", "在线随机数", "抽签工具", "随机整数生成"],
    faqs: [],
    variants: [],
  },
  "emoji-picker": {
    name: "Emoji 选择器",
    tagline: "搜索并复制任意 Emoji",
    metaTitle: "Emoji 选择器 – 在线 Emoji 搜索复制工具",
    metaDesc: "搜索任意 Emoji 并一键复制，支持按分类浏览所有表情符号。",
    keywords: ["emoji选择器", "表情符号复制", "emoji搜索", "在线emoji工具", "表情包复制"],
    faqs: [],
    variants: [],
  },
  "character-counter": {
    name: "字符计数器",
    tagline: "统计字符数、单词数和段落数",
    metaTitle: "字符计数器 – 在线免费字符/字数统计",
    metaDesc: "实时统计文本的字符数、单词数、句子数和段落数，支持设置字符上限提醒。",
    keywords: ["字符计数器", "字符统计工具", "推文字数统计", "字数限制计算", "在线字符计数"],
    faqs: [],
    variants: [],
  },
  "crypto-market-cap-comparator": {
    name: "加密货币市值对比器",
    tagline: "对比不同加密货币的市值规模",
    metaTitle: "加密货币市值对比器 – 在线加密市值比较工具",
    metaDesc: "输入两种加密货币，对比市值差异和价格潜力，了解如果市值相等价格会是多少。",
    keywords: ["加密货币市值比较", "比特币市值计算", "加密货币对比工具", "币价潜力计算", "市值比较器"],
    faqs: [],
    variants: [],
  },
  "position-size-calculator": {
    name: "仓位大小计算器",
    tagline: "根据风险管理计算最优仓位大小",
    metaTitle: "仓位大小计算器 – 交易风险管理工具",
    metaDesc: "输入账户资金、风险比例和止损点位，计算最优仓位大小，保护交易资金。",
    keywords: ["仓位计算器", "仓位大小计算", "交易风险管理", "止损仓位计算", "外汇仓位计算"],
    faqs: [
      { q: "什么是仓位管理？", a: "仓位管理是控制每笔交易风险的方法，通常建议每笔交易风险不超过账户资金的 1–2%。" },
    ],
    variants: [],
  },
  "tp-sl-calculator": {
    name: "止盈止损计算器",
    tagline: "计算交易的止盈止损价位",
    metaTitle: "止盈止损计算器 – 交易 TP/SL 计算工具",
    metaDesc: "输入入场价格和风险参数，计算止盈（Take Profit）和止损（Stop Loss）价位，优化风险回报比。",
    keywords: ["止盈止损计算器", "TP SL计算器", "交易止损计算", "风险回报比计算", "外汇止损工具"],
    faqs: [],
    variants: [],
  },
  "savings-goal-calculator": {
    name: "储蓄目标计算器",
    tagline: "计算达到储蓄目标所需时间和月存款额",
    metaTitle: "储蓄目标计算器 – 理财目标规划工具",
    metaDesc: "输入目标金额、当前储蓄和利率，计算每月需存多少钱以及何时能达成目标。",
    keywords: ["储蓄目标计算器", "存钱计划工具", "理财目标规划", "每月存款计算", "储蓄计划"],
    faqs: [],
    variants: [],
  },
};

// ── Generator ────────────────────────────────────────────────────────────────
const tools = fs.readdirSync(REGISTRY).filter(d => {
  const metaEs = path.join(REGISTRY, d, "meta.es.json");
  return fs.existsSync(metaEs);
});

let created = 0, skipped = 0;

for (const slug of tools) {
  const outPath = path.join(REGISTRY, slug, "meta.zh.json");
  if (fs.existsSync(outPath)) { skipped++; continue; }

  const metaPath = path.join(REGISTRY, slug, "meta.json");
  if (!fs.existsSync(metaPath)) continue;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  const zh = ZH[slug];
  if (!zh) {
    console.log(`  ⚠ No ZH translation for: ${slug}`);
    continue;
  }

  const output = {
    slug,
    name: zh.name,
    tagline: zh.tagline,
    description: meta.description, // keep EN description as fallback
    metaTitle: zh.metaTitle,
    metaDescription: zh.metaDesc,
    keywords: zh.keywords,
    category: CAT_ZH[meta.category] ?? meta.category,
    icon: meta.icon,
    faqs: zh.faqs.map(f => ({ question: f.q, answer: f.a })),
    relatedTools: meta.relatedTools ?? [],
    variants: zh.variants,  // only explicitly translated variants
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`  ✓ ${slug}/meta.zh.json`);
  created++;
}

console.log(`\nDone: ${created} created, ${skipped} skipped.`);
