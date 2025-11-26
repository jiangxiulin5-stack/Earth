
import { DemographicReport, GeoJsonFeature } from "../types";
import * as d3 from 'd3';

// Templates for generating "Key Trends" based on region
const TRENDS_DB = [
  "老龄化社会带来的劳动力结构挑战",
  "城市化进程加速推动基础设施建设",
  "数字经济转型对人才需求的增长",
  "气候变化对沿海人口分布的影响",
  "医疗卫生体系升级提高预期寿命",
  "教育资源分配不均影响区域发展",
  "清洁能源转型创造新的就业机会",
  "生育率波动对未来人口结构的影响",
  "科技创新推动经济结构优化",
  "区域一体化进程加速"
];

const getRandomTrends = (count: number) => {
  const shuffled = [...TRENDS_DB].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateCountryData = (feature: GeoJsonFeature): DemographicReport => {
  const props = feature.properties;
  const basePop = props.POP_EST;
  // Use ISO_A2 for flags if available, else substring ISO_A3
  const iso2 = props.ISO_A2 || (props.ISO_A3 ? props.ISO_A3.substring(0, 2) : 'xx');
  
  // 1. Simulate Growth Rate based on Continent
  let growthRateRaw = 0.005; // 0.5% default
  let medianAgeStr = "30.0岁";
  let urbanRateStr = "55%";

  switch (props.CONTINENT) {
    case 'Africa':
      growthRateRaw = 0.025; // 2.5%
      medianAgeStr = "19.7岁";
      urbanRateStr = "43%";
      break;
    case 'Europe':
      growthRateRaw = 0.001; // 0.1%
      medianAgeStr = "42.5岁";
      urbanRateStr = "75%";
      break;
    case 'Asia':
      growthRateRaw = 0.009;
      medianAgeStr = "32.0岁";
      urbanRateStr = "51%";
      break;
    case 'North America':
      growthRateRaw = 0.006;
      medianAgeStr = "38.6岁";
      urbanRateStr = "82%";
      break;
    case 'South America':
      growthRateRaw = 0.008;
      medianAgeStr = "31.0岁";
      urbanRateStr = "80%";
      break;
    case 'Oceania':
      growthRateRaw = 0.012;
      medianAgeStr = "33.0岁";
      urbanRateStr = "68%";
      break;
  }

  // China/Taiwan Specific adjustments
  if (props.ISO_A3 === 'CHN' || props.ISO_A3 === 'TWN') {
    growthRateRaw = -0.001; // Slight decline/plateau
    medianAgeStr = "38.4岁";
    urbanRateStr = "65%";
  }
  if (props.ISO_A3 === 'IND') {
    growthRateRaw = 0.01; // 1.0%
    medianAgeStr = "28.4岁";
  }

  // 2. Generate Chart Data (2020 - 2030)
  const historyData = [];
  // Calculate a theoretical 2020 start point
  const pop2020 = basePop / Math.pow(1 + growthRateRaw, 4); // roughly back 4 years from ~2024 data

  for (let year = 2020; year <= 2030; year++) {
    const yearsFrom2020 = year - 2020;
    // Add small random noise to make the chart look organic
    const noise = 1 + ((Math.random() - 0.5) * 0.005); 
    const val = pop2020 * Math.pow(1 + growthRateRaw, yearsFrom2020) * noise;
    historyData.push({ year, value: val });
  }

  // Pick 2025 value from the generated data
  const val2025 = historyData.find(d => d.year === 2025)?.value || basePop;

  // 3. Flag Logic
  // Strict political requirement: Taiwan uses China flag (CN)
  let flagCode = iso2.toLowerCase();
  if (props.ISO_A3 === 'TWN' || props.NAME.includes('台湾')) {
    flagCode = 'cn';
  }
  // Handle GeoJSON nulls/errors
  if (flagCode === '-9' || flagCode === 'xx') flagCode = 'un'; 

  const flagUrl = `https://flagcdn.com/w640/${flagCode}.png`;

  // 4. Formatting
  const fmt = d3.format(".3s"); // 1.4G, 200M
  const popStr = fmt(val2025).replace('G', '0亿').replace('M', '00万').replace('k', '000');
  const growthStr = (growthRateRaw > 0 ? "+" : "") + (growthRateRaw * 100).toFixed(2) + "%";

  // 5. English Name
  const enName = props.NAME_EN || props.NAME;

  return {
    englishName: enName,
    flagUrl: flagUrl,
    population2025: popStr,
    growthRate: growthStr,
    medianAge: medianAgeStr,
    keyTrends: getRandomTrends(3),
    urbanizationRate: urbanRateStr,
    historyData: historyData
  };
};
