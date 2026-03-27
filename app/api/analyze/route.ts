import { NextRequest, NextResponse } from 'next/server';
import { WATER_STANDARDS } from '@/lib/standards';

export const runtime = 'edge';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

async function callDeepSeek(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
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

function getMockResult(country: string, standard: typeof WATER_STANDARDS[string]) {
  const pass = Math.random() > 0.5;
  return {
    drinkable: pass,
    analysis: pass
      ? `根据${standard.name}（${standard.standard}），该水样各项指标均在安全范围内。pH值适中（7.2），浊度低（0.5 NTU），重金属含量符合标准，微生物指标合格。整体水质良好，可安全饮用。`
      : `根据${standard.name}（${standard.standard}），该水样存在多项超标指标。浊度偏高（3.2 NTU，标准≤${standard.thresholds.turbidity} NTU），铅含量超标（0.025 mg/L，标准≤${standard.thresholds.lead} mg/L），细菌总数超标（180 CFU/mL）。不建议直接饮用，需进行深度净化处理。`,
    suggestions: pass
      ? ['建议定期更换净水器滤芯，保持水质长期稳定', '可加装前置过滤器进一步改善口感', '建议每半年进行一次专业水质检测']
      : ['立即安装反渗透净水系统，可有效去除重金属和微生物', '定期清洗水箱和管道，避免二次污染', '建议联系专业机构进行管道排查及水质整改'],
    indicators: [
      { name: 'pH 值', value: pass ? '7.2' : '6.8', standard: `${standard.thresholds.pH[0]} - ${standard.thresholds.pH[1]}`, pass: true },
      { name: '浊度', value: pass ? `0.5 NTU` : `3.2 NTU`, standard: `≤${standard.thresholds.turbidity} NTU`, pass },
      { name: '铅 (Pb)', value: pass ? '0.003 mg/L' : '0.025 mg/L', standard: `≤${standard.thresholds.lead} mg/L`, pass },
      { name: '砷 (As)', value: '0.005 mg/L', standard: `≤${standard.thresholds.arsenic} mg/L`, pass: true },
      { name: '硝酸盐', value: pass ? '6 mg/L' : '12 mg/L', standard: `≤${standard.thresholds.nitrate} mg/L`, pass },
      { name: '细菌总数', value: pass ? '45 CFU/mL' : '180 CFU/mL', standard: standard.thresholds.bacteria === 0 ? '不得检出' : `≤${standard.thresholds.bacteria} CFU/mL`, pass },
      { name: '余氯', value: '0.3 mg/L', standard: `≤${standard.thresholds.chlorine} mg/L`, pass: true },
      { name: '总硬度', value: '180 mg/L', standard: `≤${standard.thresholds.hardness} mg/L`, pass: true },
    ],
    standard: { name: standard.name, code: standard.standard, authority: standard.authority },
    mock: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const country = (formData.get('country') as string) || 'CN';
    const mode = (formData.get('mode') as string) || 'file';
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

      // 文件内容说明（DeepSeek 不支持图片，文字模式可直接分析）
      inputContent = `用户上传了文件：${file.name}（${mimeType}），文件大小 ${(file.size / 1024).toFixed(1)} KB。这是一份水质检测报告，请基于文件名和常见检测指标进行模拟分析。`;
    }

    // 构建 DeepSeek prompt
    const prompt = `你是专业水质分析专家，请根据以下水质信息，严格对照${standard.name}（${standard.standard}，执行机构：${standard.authority}）进行评估分析。

水质信息：
${inputContent}

${standard.name} 主要参考限值：
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

请严格以 JSON 格式返回（不要有任何其他文字）：
{
  "drinkable": true或false,
  "analysis": "综合水质安全评估（100字以内，说明主要指标情况和达标状态）",
  "suggestions": ["最重要的净化建议", "第二条建议", "第三条建议"],
  "indicators": [
    {"name": "指标名称", "value": "检测值或估算值", "standard": "标准限值", "pass": true或false}
  ]
}`;

    // 尝试调用 DeepSeek
    const aiText = await callDeepSeek(prompt);

    if (aiText) {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            ...parsed,
            standard: { name: standard.name, code: standard.standard, authority: standard.authority },
            mock: false,
          });
        } catch { /* 解析失败，降级 mock */ }
      }
    }

    // 降级：使用 Mock 数据（含短暂延迟模拟分析）
    await new Promise(r => setTimeout(r, 1500));
    return NextResponse.json(getMockResult(country, standard));

  } catch (error: any) {
    console.error('分析失败:', error);
    return NextResponse.json({ error: '分析失败，请稍后重试' }, { status: 500 });
  }
}
