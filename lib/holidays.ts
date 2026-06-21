export interface Holiday {
  name: string;
  date: string; // MM-DD format (fixed) or "dynamic" for computed
  month: number;
  day: number;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  holidays: Holiday[];
}

// Get dynamic holidays for a given year
export function getDynamicHolidays(year: number): Record<string, Holiday[]> {
  // Easter calculation (Gregorian)
  const easter = getEaster(year);
  const easterDate = `${String(easter.month).padStart(2, "0")}-${String(easter.day).padStart(2, "0")}`;

  // Good Friday = 2 days before Easter
  const gf = new Date(year, easter.month - 1, easter.day - 2);
  const goodFriday = `${String(gf.getMonth() + 1).padStart(2, "0")}-${String(gf.getDate()).padStart(2, "0")}`;

  // Easter Monday = 1 day after Easter
  const em = new Date(year, easter.month - 1, easter.day + 1);
  const easterMonday = `${String(em.getMonth() + 1).padStart(2, "0")}-${String(em.getDate()).padStart(2, "0")}`;

  // US Thanksgiving = 4th Thursday of November
  const usThanksgiving = getNthWeekday(year, 11, 4, 4); // 4=Thursday, 4th occurrence
  const usThanksgivingStr = `${String(usThanksgiving.getMonth() + 1).padStart(2, "0")}-${String(usThanksgiving.getDate()).padStart(2, "0")}`;

  // US MLK Day = 3rd Monday of January
  const mlk = getNthWeekday(year, 1, 1, 3);
  const mlkStr = `${String(mlk.getMonth() + 1).padStart(2, "0")}-${String(mlk.getDate()).padStart(2, "0")}`;

  // US Memorial Day = last Monday of May
  const memorial = getLastWeekday(year, 5, 1);
  const memorialStr = `${String(memorial.getMonth() + 1).padStart(2, "0")}-${String(memorial.getDate()).padStart(2, "0")}`;

  // US Labor Day = 1st Monday of September
  const laborUS = getNthWeekday(year, 9, 1, 1);
  const laborUSStr = `${String(laborUS.getMonth() + 1).padStart(2, "0")}-${String(laborUS.getDate()).padStart(2, "0")}`;

  // Canadian Thanksgiving = 2nd Monday of October
  const canThanks = getNthWeekday(year, 10, 1, 2);
  const canThanksStr = `${String(canThanks.getMonth() + 1).padStart(2, "0")}-${String(canThanks.getDate()).padStart(2, "0")}`;

  // UK Spring Bank Holiday = last Monday of May
  const ukSpring = getLastWeekday(year, 5, 1);
  const ukSpringStr = `${String(ukSpring.getMonth() + 1).padStart(2, "0")}-${String(ukSpring.getDate()).padStart(2, "0")}`;

  // UK Summer Bank Holiday = last Monday of August
  const ukSummer = getLastWeekday(year, 8, 1);
  const ukSummerStr = `${String(ukSummer.getMonth() + 1).padStart(2, "0")}-${String(ukSummer.getDate()).padStart(2, "0")}`;

  return {
    easter: [{ name: "Easter Sunday", date: easterDate, month: easter.month, day: easter.day }],
    goodFriday: [{ name: "Good Friday", date: goodFriday, month: gf.getMonth() + 1, day: gf.getDate() }],
    easterMonday: [{ name: "Easter Monday", date: easterMonday, month: em.getMonth() + 1, day: em.getDate() }],
    usThanksgiving: [{ name: "Thanksgiving Day", date: usThanksgivingStr, month: usThanksgiving.getMonth() + 1, day: usThanksgiving.getDate() }],
    mlk: [{ name: "Martin Luther King Jr. Day", date: mlkStr, month: mlk.getMonth() + 1, day: mlk.getDate() }],
    memorial: [{ name: "Memorial Day", date: memorialStr, month: memorial.getMonth() + 1, day: memorial.getDate() }],
    laborUS: [{ name: "Labor Day", date: laborUSStr, month: laborUS.getMonth() + 1, day: laborUS.getDate() }],
    canThanks: [{ name: "Thanksgiving Day", date: canThanksStr, month: canThanks.getMonth() + 1, day: canThanks.getDate() }],
    ukSpring: [{ name: "Spring Bank Holiday", date: ukSpringStr, month: ukSpring.getMonth() + 1, day: ukSpring.getDate() }],
    ukSummer: [{ name: "Summer Bank Holiday", date: ukSummerStr, month: ukSummer.getMonth() + 1, day: ukSummer.getDate() }],
  };
}

function getEaster(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function getNthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const d = new Date(year, month - 1, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) {
      count++;
      if (count === nth) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
}

function getLastWeekday(year: number, month: number, weekday: number): Date {
  const d = new Date(year, month, 0); // last day of month
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return new Date(d);
}

export const countries: Country[] = [
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Chinese New Year (Spring Festival)", date: "02-05", month: 2, day: 5 },
      { name: "Tomb Sweeping Day (Qingming)", date: "04-05", month: 4, day: 5 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Dragon Boat Festival", date: "06-10", month: 6, day: 10 },
      { name: "Mid-Autumn Festival", date: "09-17", month: 9, day: 17 },
      { name: "National Day", date: "10-01", month: 10, day: 1 },
      { name: "National Day Holiday", date: "10-02", month: 10, day: 2 },
      { name: "National Day Holiday", date: "10-03", month: 10, day: 3 },
    ],
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Martin Luther King Jr. Day", date: "dynamic-mlk", month: 1, day: 0 },
      { name: "Presidents' Day", date: "02-17", month: 2, day: 17 },
      { name: "Memorial Day", date: "dynamic-memorial", month: 5, day: 0 },
      { name: "Juneteenth", date: "06-19", month: 6, day: 19 },
      { name: "Independence Day", date: "07-04", month: 7, day: 4 },
      { name: "Labor Day", date: "dynamic-laborUS", month: 9, day: 0 },
      { name: "Columbus Day", date: "10-13", month: 10, day: 13 },
      { name: "Veterans Day", date: "11-11", month: 11, day: 11 },
      { name: "Thanksgiving Day", date: "dynamic-usThanksgiving", month: 11, day: 0 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Coming of Age Day", date: "01-13", month: 1, day: 13 },
      { name: "National Foundation Day", date: "02-11", month: 2, day: 11 },
      { name: "Emperor's Birthday", date: "02-23", month: 2, day: 23 },
      { name: "Vernal Equinox Day", date: "03-20", month: 3, day: 20 },
      { name: "Showa Day", date: "04-29", month: 4, day: 29 },
      { name: "Constitution Memorial Day", date: "05-03", month: 5, day: 3 },
      { name: "Greenery Day", date: "05-04", month: 5, day: 4 },
      { name: "Children's Day", date: "05-05", month: 5, day: 5 },
      { name: "Marine Day", date: "07-21", month: 7, day: 21 },
      { name: "Mountain Day", date: "08-11", month: 8, day: 11 },
      { name: "Respect for the Aged Day", date: "09-15", month: 9, day: 15 },
      { name: "Autumnal Equinox Day", date: "09-23", month: 9, day: 23 },
      { name: "Sports Day", date: "10-13", month: 10, day: 13 },
      { name: "Culture Day", date: "11-03", month: 11, day: 3 },
      { name: "Labour Thanksgiving Day", date: "11-23", month: 11, day: 23 },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Easter Monday", date: "dynamic-easterMonday", month: 4, day: 0 },
      { name: "Early May Bank Holiday", date: "05-05", month: 5, day: 5 },
      { name: "Spring Bank Holiday", date: "dynamic-ukSpring", month: 5, day: 0 },
      { name: "Summer Bank Holiday", date: "dynamic-ukSummer", month: 8, day: 0 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
      { name: "Boxing Day", date: "12-26", month: 12, day: 26 },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Easter Sunday", date: "dynamic-easter", month: 4, day: 0 },
      { name: "Easter Monday", date: "dynamic-easterMonday", month: 4, day: 0 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Ascension Day", date: "05-29", month: 5, day: 29 },
      { name: "Whit Monday", date: "06-09", month: 6, day: 9 },
      { name: "German Unity Day", date: "10-03", month: 10, day: 3 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
      { name: "Boxing Day", date: "12-26", month: 12, day: 26 },
    ],
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Easter Monday", date: "dynamic-easterMonday", month: 4, day: 0 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Victory in Europe Day", date: "05-08", month: 5, day: 8 },
      { name: "Ascension Day", date: "05-29", month: 5, day: 29 },
      { name: "Whit Monday", date: "06-09", month: 6, day: 9 },
      { name: "Bastille Day", date: "07-14", month: 7, day: 14 },
      { name: "Assumption of Mary", date: "08-15", month: 8, day: 15 },
      { name: "All Saints' Day", date: "11-01", month: 11, day: 1 },
      { name: "Armistice Day", date: "11-11", month: 11, day: 11 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "KR",
    name: "South Korea",
    flag: "🇰🇷",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Seollal (Lunar New Year)", date: "01-29", month: 1, day: 29 },
      { name: "Independence Movement Day", date: "03-01", month: 3, day: 1 },
      { name: "Children's Day", date: "05-05", month: 5, day: 5 },
      { name: "Buddha's Birthday", date: "05-15", month: 5, day: 15 },
      { name: "Memorial Day", date: "06-06", month: 6, day: 6 },
      { name: "National Liberation Day", date: "08-15", month: 8, day: 15 },
      { name: "Chuseok (Harvest Festival)", date: "10-06", month: 10, day: 6 },
      { name: "National Foundation Day", date: "10-03", month: 10, day: 3 },
      { name: "Hangul Day", date: "10-09", month: 10, day: 9 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Republic Day", date: "01-26", month: 1, day: 26 },
      { name: "Holi", date: "03-14", month: 3, day: 14 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Ambedkar Jayanti", date: "04-14", month: 4, day: 14 },
      { name: "Ram Navami", date: "04-06", month: 4, day: 6 },
      { name: "Independence Day", date: "08-15", month: 8, day: 15 },
      { name: "Gandhi Jayanti", date: "10-02", month: 10, day: 2 },
      { name: "Dussehra", date: "10-02", month: 10, day: 2 },
      { name: "Diwali", date: "10-21", month: 10, day: 21 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Chinese New Year", date: "01-29", month: 1, day: 29 },
      { name: "Chinese New Year (Day 2)", date: "01-30", month: 1, day: 30 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Vesak Day", date: "05-12", month: 5, day: 12 },
      { name: "Hari Raya Puasa", date: "03-31", month: 3, day: 31 },
      { name: "Hari Raya Haji", date: "06-07", month: 6, day: 7 },
      { name: "National Day", date: "08-09", month: 8, day: 9 },
      { name: "Deepavali", date: "10-21", month: 10, day: 21 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Australia Day", date: "01-27", month: 1, day: 27 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Easter Saturday", date: "dynamic-easter", month: 4, day: 0 },
      { name: "Easter Monday", date: "dynamic-easterMonday", month: 4, day: 0 },
      { name: "ANZAC Day", date: "04-25", month: 4, day: 25 },
      { name: "Queen's Birthday", date: "06-09", month: 6, day: 9 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
      { name: "Boxing Day", date: "12-26", month: 12, day: 26 },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Easter Monday", date: "dynamic-easterMonday", month: 4, day: 0 },
      { name: "Victoria Day", date: "05-19", month: 5, day: 19 },
      { name: "Canada Day", date: "07-01", month: 7, day: 1 },
      { name: "Labour Day", date: "09-01", month: 9, day: 1 },
      { name: "National Day for Truth and Reconciliation", date: "09-30", month: 9, day: 30 },
      { name: "Thanksgiving Day", date: "dynamic-canThanks", month: 10, day: 0 },
      { name: "Remembrance Day", date: "11-11", month: 11, day: 11 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
      { name: "Boxing Day", date: "12-26", month: 12, day: 26 },
    ],
  },
  {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Makha Bucha Day", date: "02-12", month: 2, day: 12 },
      { name: "Chakri Memorial Day", date: "04-06", month: 4, day: 6 },
      { name: "Songkran Festival", date: "04-13", month: 4, day: 13 },
      { name: "Songkran Festival", date: "04-14", month: 4, day: 14 },
      { name: "Songkran Festival", date: "04-15", month: 4, day: 15 },
      { name: "National Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Coronation Day", date: "05-04", month: 5, day: 4 },
      { name: "Visakha Bucha Day", date: "05-12", month: 5, day: 12 },
      { name: "Queen's Birthday", date: "06-03", month: 6, day: 3 },
      { name: "King's Birthday", date: "07-28", month: 7, day: 28 },
      { name: "Asahna Bucha Day", date: "08-10", month: 8, day: 10 },
      { name: "Queen Mother's Birthday", date: "08-12", month: 8, day: 12 },
      { name: "National Day", date: "10-23", month: 10, day: 23 },
      { name: "King Bhumibol Memorial Day", date: "10-13", month: 10, day: 13 },
      { name: "Constitution Day", date: "12-10", month: 12, day: 10 },
      { name: "New Year's Eve", date: "12-31", month: 12, day: 31 },
    ],
  },
  {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Tết (Lunar New Year)", date: "01-29", month: 1, day: 29 },
      { name: "Tết Holiday", date: "01-30", month: 1, day: 30 },
      { name: "Tết Holiday", date: "01-31", month: 1, day: 31 },
      { name: "Tết Holiday", date: "02-01", month: 2, day: 1 },
      { name: "Tết Holiday", date: "02-02", month: 2, day: 2 },
      { name: "Hùng Kings Festival", date: "04-07", month: 4, day: 7 },
      { name: "Reunification Day", date: "04-30", month: 4, day: 30 },
      { name: "International Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "National Day", date: "09-02", month: 9, day: 2 },
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Chinese New Year", date: "01-29", month: 1, day: 29 },
      { name: "Chinese New Year (Day 2)", date: "01-30", month: 1, day: 30 },
      { name: "Thaipusam", date: "02-11", month: 2, day: 11 },
      { name: "Federal Territory Day", date: "02-01", month: 2, day: 1 },
      { name: "Hari Raya Aidilfitri", date: "03-31", month: 3, day: 31 },
      { name: "Hari Raya Aidilfitri (Day 2)", date: "04-01", month: 4, day: 1 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Wesak Day", date: "05-12", month: 5, day: 12 },
      { name: "Yang di-Pertuan Agong's Birthday", date: "06-02", month: 6, day: 2 },
      { name: "Hari Raya Aidiladha", date: "06-07", month: 6, day: 7 },
      { name: "National Day", date: "08-31", month: 8, day: 31 },
      { name: "Malaysia Day", date: "09-16", month: 9, day: 16 },
      { name: "Deepavali", date: "10-21", month: 10, day: 21 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
    ],
  },
  {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    holidays: [
      { name: "New Year's Day", date: "01-01", month: 1, day: 1 },
      { name: "Chinese New Year", date: "01-29", month: 1, day: 29 },
      { name: "EDSA Revolution Anniversary", date: "02-25", month: 2, day: 25 },
      { name: "Maundy Thursday", date: "04-17", month: 4, day: 17 },
      { name: "Good Friday", date: "dynamic-goodFriday", month: 4, day: 0 },
      { name: "Araw ng Kagitingan", date: "04-09", month: 4, day: 9 },
      { name: "Labour Day", date: "05-01", month: 5, day: 1 },
      { name: "Independence Day", date: "06-12", month: 6, day: 12 },
      { name: "Eid al-Fitr", date: "03-31", month: 3, day: 31 },
      { name: "Eid al-Adha", date: "06-07", month: 6, day: 7 },
      { name: "Ninoy Aquino Day", date: "08-21", month: 8, day: 21 },
      { name: "National Heroes Day", date: "08-25", month: 8, day: 25 },
      { name: "All Saints' Day", date: "11-01", month: 11, day: 1 },
      { name: "Bonifacio Day", date: "11-30", month: 11, day: 30 },
      { name: "Christmas Day", date: "12-25", month: 12, day: 25 },
      { name: "Rizal Day", date: "12-30", month: 12, day: 30 },
    ],
  },
];
