import { NextRequest, NextResponse } from 'next/server';
import { WATER_STANDARDS } from '@/lib/standards';
import { getSession } from '@/lib/auth';
import { checkGuestLimit, checkFreeUserLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';

export const runtime = 'edge';

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '';
const AI_API_BASE = process.env.AI_API_BASE || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

async function callAI(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(`${AI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: lang === 'en'
              ? 'You are a professional water quality analysis expert with deep knowledge in water treatment engineering and public health. You MUST respond entirely in English regardless of the language of the input. Your analysis should be professional, detailed, and easy for general users to understand.'
              : '你是一位专业的水质分析专家，拥有深厚的水处理工程和公共卫生知识。无论用户输入是什么语言，你必须完全用中文回复。你的分析需要专业、详细、易于普通用户理解，并能给出切实可行的建议。',
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    });
    const data = await res.json();
    if (data.error || !data.choices) return null;
    return data.choices[0].message.content;
  } catch {
    return null;
  }
}

function buildPrompt(inputContent: string, standard: typeof WATER_STANDARDS[string], lang: string): string {
  const isEn = lang === 'en';
  const standardLabel = isEn ? standard.nameEn : standard.name;

  if (isEn) {
    return `You are a professional water quality analysis expert. IMPORTANT: You must respond ENTIRELY in English, regardless of what language the input data is in.

Based on the following water quality information, conduct a comprehensive in-depth assessment against ${standardLabel} (${standard.standard}, Authority: ${standard.authority}).

Water Quality Data:
${inputContent}

${standardLabel} Reference Limits:
- pH: ${standard.thresholds.pH[0]} ~ ${standard.thresholds.pH[1]}
- Turbidity: ≤${standard.thresholds.turbidity} NTU
- Lead (Pb): ≤${standard.thresholds.lead} mg/L
- Arsenic (As): ≤${standard.thresholds.arsenic} mg/L
- Nitrate: ≤${standard.thresholds.nitrate} mg/L
- Fluoride: ≤${standard.thresholds.fluoride} mg/L
- Bacteria: ${standard.thresholds.bacteria === 0 ? 'Not detectable' : `≤${standard.thresholds.bacteria} CFU/mL`}
- Residual Chlorine: ≤${standard.thresholds.chlorine} mg/L
- Total Hardness: ≤${standard.thresholds.hardness} mg/L
- Iron (Fe): ≤${standard.thresholds.iron} mg/L
- Manganese (Mn): ≤${standard.thresholds.manganese} mg/L
- Ammonia: ≤${standard.thresholds.ammonia} mg/L
- Color: ≤${standard.thresholds.color} TCU

Return STRICTLY in the following JSON format (no other text, no markdown code blocks):
{
  "drinkable": true or false,
  "analysis": "[Overall Assessment] 2-3 sentences summarizing overall water quality and whether it is safe to drink",
  "detail": "[Detailed Analysis] For each parameter that exceeds the standard, explain:\\n① Current status (measured value vs. standard limit)\\n② Possible causes of exceedance (aging pipes, industrial pollution, geological factors, etc.)\\n③ Specific health risks (short-term/long-term effects)\\n④ Main treatment methods and their effectiveness (e.g., reverse osmosis, activated carbon filtration, UV disinfection)\\n⑤ Pros and cons of each treatment option\\n⑥ Recommended safest and most cost-effective solution\\nIf no parameters exceed limits, describe overall good water quality and provide maintenance tips.",
  "suggestions": [
    "[Best Option] Safest and most cost-effective treatment recommendation (with reason and expected outcome)",
    "[Alternative] Second recommended option (with pros and cons)",
    "[Maintenance] Long-term water quality maintenance tips"
  ],
  "indicators": [
    {"name": "Parameter name (English)", "value": "Measured value with unit", "standard": "Standard limit", "pass": true or false}
  ]
}`;
  }

  return `你是专业水质分析专家。重要提示：无论输入数据是什么语言，你必须完全用中文回复。

请根据以下水质信息，严格对照${standardLabel}（${standard.standard}，执行机构：${standard.authority}）进行全面深度评估分析。

水质信息：
${inputContent}

${standardLabel} 主要参考限值：
- pH: ${standard.thresholds.pH[0]} ~ ${standard.thresholds.pH[1]}
- 浊度: ≤${standard.thresholds.turbidity} NTU
- 铅(Pb): ≤${standard.thresholds.lead} mg/L
- 砷(As): ≤${standard.thresholds.arsenic} mg/L
- 硝酸盐: ≤${standard.thresholds.nitrate} mg/L
- 氟化物: ≤${standard.thresholds.fluoride} mg/L
- 细菌总数: ${standard.thresholds.bacteria === 0 ? '不得检出' : `≤${standard.thresholds.bacteria} CFU/mL`}
- 余氯: ≤${standard.thresholds.chlorine} mg/L
- 总硬度: ≤${standard.thresholds.hardness} mg/L
- 铁(Fe): ≤${standard.thresholds.iron} mg/L
- 锰(Mn): ≤${standard.thresholds.manganese} mg/L
- 氨氮: ≤${standard.thresholds.ammonia} mg/L
- 色度: ≤${standard.thresholds.color} TCU

请严格以如下 JSON 格式返回（不要有任何其他文字，不要用 markdown 代码块包裹）：
{
  "drinkable": true或false,
  "analysis": "【综合评估】用2-3句话简明说明整体水质状况和是否可饮用",
  "detail": "【详细分析】针对每个超标指标，分别说明：\n① 指标现状（当前值 vs 标准值）\n② 超标的可能原因（管道老化、工业污染、地质因素等）\n③ 对人体健康的具体危害（短期/长期影响）\n④ 主要处理方法及效果（如反渗透、活性炭过滤、紫外线消毒等）\n⑤ 各处理方案优劣对比\n⑥ 综合推荐最安全且性价比最高的解决方案\n如无超标指标，说明水质整体良好，并给出保持水质的维护建议。",
  "suggestions": [
    "【首选方案】最安全高性价比的具体处理建议（说明原因和预期效果）",
    "【备选方案】第二推荐方案（含优缺点说明）",
    "【日常维护】长期保持水质的维护建议"
  ],
  "indicators": [
    {"name": "指标名称（中文）", "value": "检测值或估算值（含单位）", "standard": "标准限值", "pass": true或false}
  ]
}`;
}

function getMockResult(country: string, standard: typeof WATER_STANDARDS[string], lang: string) {
  const isEn = lang === 'en';
  const pass = Math.random() > 0.5;
  const stdLabel = isEn ? standard.nameEn : standard.name;

  return {
    drinkable: pass,
    analysis: isEn
      ? (pass
          ? `Based on ${stdLabel} (${standard.standard}), all major parameters of this water sample are within safe limits. Overall water quality is good and safe to drink.`
          : `Based on ${stdLabel} (${standard.standard}), this water sample has multiple parameters exceeding limits, including elevated turbidity and lead content. Direct consumption is not recommended; deep purification treatment is required.`)
      : (pass
          ? `根据${stdLabel}（${standard.standard}），该水样各项主要指标均在安全范围内，整体水质良好，可安全饮用。`
          : `根据${stdLabel}（${standard.standard}），该水样存在多项超标指标，包括浊度偏高和铅含量超标，不建议直接饮用，需进行深度净化处理。`),
    detail: isEn
      ? (pass
          ? `[Overall Assessment] Water quality fully meets ${stdLabel} requirements, all indicators within safe thresholds.\n\n[Maintenance Tips]\n① Professional water quality testing every 6 months is recommended.\n② Replace water filter cartridges every 6–12 months to prevent performance degradation.\n③ Clean faucet aerators regularly to prevent scale and particle buildup.\n④ If using a storage tank, clean it quarterly to prevent bacterial growth.`
          : `[Detailed Analysis]\n\n▌Turbidity Exceedance (3.2 NTU, Standard ≤${standard.thresholds.turbidity} NTU)\n① Status: Measured 3.2 NTU exceeds limit by ${((3.2 / standard.thresholds.turbidity - 1) * 100).toFixed(0)}%.\n② Possible Causes: Pipe corrosion, secondary contamination, increased sediment from water source.\n③ Health Risks: Turbid water may carry pathogens; long-term consumption can affect the digestive system.\n④ Treatment: Ultrafiltration membrane (>99% removal rate) is most effective; activated carbon also improves clarity.\n⑤ Comparison: Ultrafiltration (effective, moderate cost) vs. sedimentation + disinfection (low cost, moderate effect).\n⑥ Recommendation: Install an ultrafiltration water purifier — best value for long-term turbidity control.\n\n▌Lead Exceedance (0.025 mg/L, Standard ≤${standard.thresholds.lead} mg/L)\n① Status: Lead at 0.025 mg/L exceeds standard by ${((0.025 / standard.thresholds.lead - 1) * 100).toFixed(0)}%.\n② Possible Causes: Old lead pipes corroding, lead-containing solder materials leaching.\n③ Health Risks: Lead is a heavy metal; long-term ingestion damages the nervous system, especially harmful to children's intellectual development.\n④ Treatment: Reverse osmosis (RO) removes >95% of heavy metals — most effective method available.\n⑤ Comparison: Reverse osmosis (best results, slightly higher running cost) vs. activated carbon (partial removal, lower cost).\n⑥ Recommendation: Install an RO water purifier and contact your building manager to inspect and replace any old lead pipes.`)
      : (pass
          ? `【综合评估】水质整体符合${stdLabel}要求，各项检测指标均在安全阈值内。\n\n【维护建议】\n① 建议每半年进行一次专业水质检测，及时掌握水质变化趋势。\n② 定期更换净水器滤芯（一般6-12个月一次），防止滤芯失效导致水质下降。\n③ 清洁水龙头过滤网，避免水垢和杂质积累影响口感。\n④ 如果使用储水箱，建议每季度清洁一次，防止细菌滋生。`
          : `【详细分析】\n\n▌浊度超标（3.2 NTU，标准≤${standard.thresholds.turbidity} NTU）\n① 可能原因：管道锈蚀、二次污染、水源沉淀物增加。\n② 健康危害：浑浊水中可能携带病原微生物，长期饮用影响消化系统健康。\n③ 处理方法：超滤膜过滤效果最佳（去除率>99%），活性炭过滤也可改善。\n④ 方案对比：超滤膜（效果好、成本中等）vs 沉淀+消毒（成本低、效果一般）。\n⑤ 推荐：安装超滤净水器，性价比高，可长期稳定解决浊度问题。\n\n▌铅超标（0.025 mg/L，标准≤${standard.thresholds.lead} mg/L）\n① 可能原因：老旧铅制管道腐蚀、焊接材料含铅析出。\n② 健康危害：铅是重金属，长期摄入损害神经系统，对儿童影响尤为严重，可导致智力发育障碍。\n③ 处理方法：反渗透（RO）过滤去除率>95%，是最有效的重金属去除方式。\n④ 方案对比：反渗透（效果最佳、运营成本稍高）vs 活性炭（部分去除、成本低）。\n⑤ 推荐：优先安装反渗透净水设备，同时联系房屋管理方检查并更换老旧铅管。`),
    suggestions: isEn
      ? (pass
          ? ['Replace water filter cartridges regularly (every 6–12 months, ~$10–30) to maintain stable water quality.', 'Install a pre-filter (~$30–80) to extend the life of your main filter and further improve taste.', 'Schedule professional water quality testing every 6 months to detect any changes early.']
          : ['[Best Option] Install a Reverse Osmosis (RO) purifier: removes >95% of lead and bacteria. Cost $150–600, annual running cost ~$30. Safest choice for home use.', '[Alternative] Install an ultrafiltration purifier: effectively addresses turbidity and bacteria, cost $50–200, but limited heavy metal removal. Suitable for tighter budgets.', 'Contact your building manager to inspect supply pipes. If old lead pipes are found, request replacement to eliminate contamination at the source.'])
      : (pass
          ? ['定期更换净水器滤芯，保持水质稳定，建议每6-12个月更换一次，费用约50-200元', '加装前置过滤器（约200-500元），延长净水器使用寿命并进一步改善口感', '每半年进行一次专业水质检测，及时发现水质变化']
          : ['【首选】安装反渗透（RO）净水器：可有效去除铅等重金属（>95%）及细菌，价格800-3000元，长期使用成本约每年200元，是最安全的家用选择', '【备选】安装超滤净水器：有效解决浊度和细菌问题，价格300-1500元，但对铅等重金属去除效果有限，适合预算有限的情况', '联系房屋管理方检查供水管道，如有老旧铅管应申请更换，从源头解决重金属污染问题']),
    indicators: isEn
      ? [
          { name: 'pH', value: pass ? '7.2' : '6.8', standard: `${standard.thresholds.pH[0]} - ${standard.thresholds.pH[1]}`, pass: true },
          { name: 'Turbidity', value: pass ? '0.5 NTU' : '3.2 NTU', standard: `≤${standard.thresholds.turbidity} NTU`, pass },
          { name: 'Lead (Pb)', value: pass ? '0.003 mg/L' : '0.025 mg/L', standard: `≤${standard.thresholds.lead} mg/L`, pass },
          { name: 'Arsenic (As)', value: '0.005 mg/L', standard: `≤${standard.thresholds.arsenic} mg/L`, pass: true },
          { name: 'Nitrate', value: pass ? '6 mg/L' : '12 mg/L', standard: `≤${standard.thresholds.nitrate} mg/L`, pass },
          { name: 'Bacteria', value: pass ? '45 CFU/mL' : '180 CFU/mL', standard: standard.thresholds.bacteria === 0 ? 'Not detectable' : `≤${standard.thresholds.bacteria} CFU/mL`, pass },
          { name: 'Residual Chlorine', value: '0.3 mg/L', standard: `≤${standard.thresholds.chlorine} mg/L`, pass: true },
          { name: 'Total Hardness', value: '180 mg/L', standard: `≤${standard.thresholds.hardness} mg/L`, pass: true },
        ]
      : [
          { name: 'pH 值', value: pass ? '7.2' : '6.8', standard: `${standard.thresholds.pH[0]} - ${standard.thresholds.pH[1]}`, pass: true },
          { name: '浊度', value: pass ? '0.5 NTU' : '3.2 NTU', standard: `≤${standard.thresholds.turbidity} NTU`, pass },
          { name: '铅 (Pb)', value: pass ? '0.003 mg/L' : '0.025 mg/L', standard: `≤${standard.thresholds.lead} mg/L`, pass },
          { name: '砷 (As)', value: '0.005 mg/L', standard: `≤${standard.thresholds.arsenic} mg/L`, pass: true },
          { name: '硝酸盐', value: pass ? '6 mg/L' : '12 mg/L', standard: `≤${standard.thresholds.nitrate} mg/L`, pass },
          { name: '细菌总数', value: pass ? '45 CFU/mL' : '180 CFU/mL', standard: standard.thresholds.bacteria === 0 ? '不得检出' : `≤${standard.thresholds.bacteria} CFU/mL`, pass },
          { name: '余氯', value: '0.3 mg/L', standard: `≤${standard.thresholds.chlorine} mg/L`, pass: true },
          { name: '总硬度', value: '180 mg/L', standard: `≤${standard.thresholds.hardness} mg/L`, pass: true },
        ],
    standard: { name: stdLabel, code: standard.standard, authority: standard.authority },
    mock: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      const ip = request.headers.get('cf-connecting-ip') ||
                 request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';
      const limitCheck = checkGuestLimit(ip);
      if (!limitCheck.allowed) {
        const resetDate = new Date(limitCheck.resetTime!);
        return NextResponse.json({
          error: `游客每天只能分析1次。请登录解锁更多次数，或等待至 ${resetDate.toLocaleString('zh-CN')} 后重试。`
        }, { status: 429 });
      }
    } else {
      const user = db.getUser(session.sub);
      if (user && user.userType === 'free') {
        const limitCheck = checkFreeUserLimit(user.id);
        if (!limitCheck.allowed) {
          const resetDate = new Date(limitCheck.resetTime!);
          return NextResponse.json({
            error: `免费用户每天只能分析1次。请升级套餐解锁更多次数，或等待至 ${resetDate.toLocaleString('zh-CN')} 后重试。`
          }, { status: 429 });
        }
      }
    }

    const formData = await request.formData();
    const country = (formData.get('country') as string) || 'CN';
    const mode = (formData.get('mode') as string) || 'file';
    const lang = (formData.get('lang') as string) || 'en';
    const standard = WATER_STANDARDS[country] || WATER_STANDARDS.CN;

    let inputContent = '';

    if (mode === 'text') {
      const text = formData.get('text') as string;
      if (!text || text.trim().length < 10) {
        return NextResponse.json({ error: '请输入至少10个字符的水质描述' }, { status: 400 });
      }
      inputContent = text.trim();
    } else {
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: '未上传文件' }, { status: 400 });

      const mimeType = file.type;
      const isImage = mimeType.startsWith('image/');
      const isPDF = mimeType === 'application/pdf';
      const isWord = mimeType.includes('word') || mimeType.includes('document');
      const isExcel = mimeType.includes('sheet') || mimeType.includes('excel');

      if (!isImage && !isPDF && !isWord && !isExcel) {
        return NextResponse.json({ error: '请上传 PDF、图片、Word 或 Excel 文件' }, { status: 400 });
      }

      inputContent = `用户上传了水质检测报告文件：${file.name}（${mimeType}），文件大小 ${(file.size / 1024).toFixed(1)} KB。请基于该文件类型和常见水质检测报告的典型指标，结合对应标准进行专业模拟分析。`;
    }

    // 构建详细 Prompt 并调用 AI
    const prompt = buildPrompt(inputContent, standard, lang);
    const aiText = await callAI(prompt);

    if (aiText) {
      // 尝试从返回文本中提取 JSON
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            ...parsed,
            standard: { name: standard.name, code: standard.standard, authority: standard.authority },
            mock: false,
          });
        } catch { /* JSON 解析失败，降级 mock */ }
      }
    }

    // 降级：返回 Mock 数据
    await new Promise(r => setTimeout(r, 1500));
    return NextResponse.json(getMockResult(country, standard, lang));

  } catch (error: any) {
    console.error('分析失败:', error);
    return NextResponse.json({ error: '分析失败，请稍后重试' }, { status: 500 });
  }
}


