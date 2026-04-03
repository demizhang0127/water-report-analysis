// 全球饮用水标准数据库
// 数据来源：WHO Guidelines for Drinking-water Quality (2022)、各国官方标准
export const WATER_STANDARDS: Record<string, {
  name: string;
  flag: string;
  standard: string;
  authority: string;
  region: string;
  thresholds: {
    pH: [number, number];
    turbidity: number; // NTU
    lead: number;      // mg/L
    arsenic: number;   // mg/L
    nitrate: number;   // mg/L (as NO3)
    fluoride: number;  // mg/L
    bacteria: number;  // CFU/100mL (0 = not detectable)
    chlorine: number;  // mg/L residual
    hardness: number;  // mg/L as CaCO3
    iron: number;      // mg/L
    manganese: number; // mg/L
    ammonia: number;   // mg/L
    color: number;     // TCU
  };
}> = {
  // ─── 参考基准 ───
  WHO: {
    name: 'WHO 国际标准', flag: '🌍', standard: 'WHO GDWQ 2022',
    authority: 'World Health Organization',
    region: '国际',
    thresholds: { pH: [6.5, 8.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 500, iron: 0.3, manganese: 0.08, ammonia: 1.5, color: 15 }
  },

  // ─── 亚洲 ───
  CN: {
    name: '中国', flag: '🇨🇳', standard: 'GB 5749-2022',
    authority: '国家卫生健康委员会',
    region: '亚洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 1, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 1.0, bacteria: 0, chlorine: 4, hardness: 450, iron: 0.3, manganese: 0.1, ammonia: 0.5, color: 15 }
  },
  JP: {
    name: '日本', flag: '🇯🇵', standard: '水道法 (2020)',
    authority: '厚生労働省',
    region: '亚洲',
    thresholds: { pH: [5.8, 8.6], turbidity: 2, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 0.8, bacteria: 0, chlorine: 1, hardness: 300, iron: 0.3, manganese: 0.05, ammonia: 0.1, color: 5 }
  },
  KR: {
    name: '韩国', flag: '🇰🇷', standard: '먹는물 수질기준 (2021)',
    authority: '環境部',
    region: '亚洲',
    thresholds: { pH: [5.8, 8.5], turbidity: 0.5, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 1.5, bacteria: 0, chlorine: 4, hardness: 300, iron: 0.3, manganese: 0.05, ammonia: 0.5, color: 5 }
  },
  IN: {
    name: '印度', flag: '🇮🇳', standard: 'IS 10500:2012',
    authority: 'Bureau of Indian Standards',
    region: '亚洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 45, fluoride: 1.0, bacteria: 0, chlorine: 5, hardness: 300, iron: 0.3, manganese: 0.1, ammonia: 0.5, color: 15 }
  },
  SG: {
    name: '新加坡', flag: '🇸🇬', standard: 'ENV PUB Standards (2019)',
    authority: 'Public Utilities Board',
    region: '亚洲',
    thresholds: { pH: [6.5, 9.0], turbidity: 1, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 0.7, bacteria: 0, chlorine: 5, hardness: 300, iron: 0.3, manganese: 0.05, ammonia: 1.5, color: 15 }
  },
  TH: {
    name: '泰国', flag: '🇹🇭', standard: 'TIS 257-2549',
    authority: 'สำนักงานมาตรฐานผลิตภัณฑ์อุตสาหกรรม',
    region: '亚洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 5, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 500, iron: 0.5, manganese: 0.3, ammonia: 1.5, color: 15 }
  },

  // ─── 欧洲 ───
  EU: {
    name: '欧盟', flag: '🇪🇺', standard: 'EU Directive 2020/2184',
    authority: 'European Commission',
    region: '欧洲',
    thresholds: { pH: [6.5, 9.5], turbidity: 1, lead: 0.005, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 0.25, hardness: 60, iron: 0.2, manganese: 0.05, ammonia: 0.5, color: 20 }
  },
  GB: {
    name: '英国', flag: '🇬🇧', standard: 'Water Supply Regulations 2016',
    authority: 'Drinking Water Inspectorate',
    region: '欧洲',
    thresholds: { pH: [6.5, 9.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 0.25, hardness: 60, iron: 0.2, manganese: 0.05, ammonia: 0.5, color: 20 }
  },
  DE: {
    name: '德国', flag: '🇩🇪', standard: 'Trinkwasserverordnung 2023',
    authority: 'Umweltbundesamt',
    region: '欧洲',
    thresholds: { pH: [6.5, 9.5], turbidity: 1, lead: 0.005, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 0.3, hardness: 60, iron: 0.2, manganese: 0.05, ammonia: 0.5, color: 20 }
  },
  FR: {
    name: '法国', flag: '🇫🇷', standard: 'Arrêté du 11 janvier 2007',
    authority: 'Ministère de la Santé',
    region: '欧洲',
    thresholds: { pH: [6.5, 9.0], turbidity: 1, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 0.25, hardness: 60, iron: 0.2, manganese: 0.05, ammonia: 0.5, color: 15 }
  },

  // ─── 北美洲 ───
  US: {
    name: '美国', flag: '🇺🇸', standard: 'EPA NPDWR 2023',
    authority: 'Environmental Protection Agency',
    region: '北美洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 1, lead: 0.015, arsenic: 0.01, nitrate: 10, fluoride: 4.0, bacteria: 0, chlorine: 4, hardness: 500, iron: 0.3, manganese: 0.05, ammonia: 3.0, color: 15 }
  },
  CA: {
    name: '加拿大', flag: '🇨🇦', standard: 'Health Canada GCDWQ 2020',
    authority: 'Health Canada',
    region: '北美洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 1, lead: 0.005, arsenic: 0.01, nitrate: 10, fluoride: 1.5, bacteria: 0, chlorine: 4, hardness: 500, iron: 0.3, manganese: 0.02, ammonia: 3.0, color: 15 }
  },
  MX: {
    name: '墨西哥', flag: '🇲🇽', standard: 'NOM-127-SSA1-2021',
    authority: 'Secretaría de Salud',
    region: '北美洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 1.5, bacteria: 0, chlorine: 4, hardness: 500, iron: 0.3, manganese: 0.15, ammonia: 0.5, color: 20 }
  },

  // ─── 大洋洲 ───
  AU: {
    name: '澳大利亚', flag: '🇦🇺', standard: 'ADWG 2022 (NHMRC)',
    authority: 'National Health and Medical Research Council',
    region: '大洋洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 5, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 200, iron: 0.3, manganese: 0.1, ammonia: 0.5, color: 15 }
  },
  NZ: {
    name: '新西兰', flag: '🇳🇿', standard: 'DWSNZ 2022',
    authority: 'Ministry of Health',
    region: '大洋洲',
    thresholds: { pH: [7.0, 8.5], turbidity: 2.5, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 200, iron: 0.2, manganese: 0.04, ammonia: 1.5, color: 15 }
  },

  // ─── 南美洲 ───
  BR: {
    name: '巴西', flag: '🇧🇷', standard: 'Portaria GM/MS 888/2021',
    authority: 'Ministério da Saúde',
    region: '南美洲',
    thresholds: { pH: [6.0, 9.5], turbidity: 5, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 500, iron: 0.3, manganese: 0.1, ammonia: 1.5, color: 15 }
  },

  // ─── 中东/非洲 ───
  SA: {
    name: '沙特阿拉伯', flag: '🇸🇦', standard: 'GSO 149/2009',
    authority: 'Saudi Standards, Metrology & Quality Org.',
    region: '中东',
    thresholds: { pH: [6.5, 8.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 50, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 500, iron: 0.3, manganese: 0.1, ammonia: 1.5, color: 15 }
  },
  ZA: {
    name: '南非', flag: '🇿🇦', standard: 'SANS 241:2015',
    authority: 'South African Bureau of Standards',
    region: '非洲',
    thresholds: { pH: [6.5, 8.5], turbidity: 4, lead: 0.01, arsenic: 0.01, nitrate: 10, fluoride: 1.5, bacteria: 0, chlorine: 5, hardness: 200, iron: 0.3, manganese: 0.1, ammonia: 1.5, color: 15 }
  },
};

// 按地区分组，用于前端选择器
export const REGIONS = [
  { label: '国际', codes: ['WHO'] },
  { label: '亚洲', codes: ['CN', 'JP', 'KR', 'IN', 'SG', 'TH'] },
  { label: '欧洲', codes: ['EU', 'GB', 'DE', 'FR'] },
  { label: '北美洲', codes: ['US', 'CA', 'MX'] },
  { label: '大洋洲', codes: ['AU', 'NZ'] },
  { label: '南美洲', codes: ['BR'] },
  { label: '中东/非洲', codes: ['SA', 'ZA'] },
];
