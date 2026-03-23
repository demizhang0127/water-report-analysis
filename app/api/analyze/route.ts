import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const country = formData.get('country') as string;

    if (!file) {
      return NextResponse.json({ error: '未上传文件' }, { status: 400 });
    }

    // 模拟数据解析（实际需要调用 Python 服务）
    const mockData = {
      pH: 7.2,
      turbidity: 0.8,
      lead: 0.005,
      bacteria: 50,
    };

    // 获取标准
    const standards = getStandards(country);
    
    // 比对数据
    const comparison = compareWithStandards(mockData, standards);
    
    // 调用 OpenAI 分析
    const analysis = await getAIAnalysis(mockData, comparison, country);

    return NextResponse.json({
      drinkable: comparison.drinkable,
      analysis: analysis.summary,
      suggestions: analysis.suggestions,
      details: comparison.details,
    });
  } catch (error) {
    console.error('分析失败:', error);
    return NextResponse.json({ error: '分析失败' }, { status: 500 });
  }
}

function getStandards(country: string) {
  const standards: any = {
    CN: { pH: [6.5, 8.5], turbidity: 1, lead: 0.01, bacteria: 100 },
    US: { pH: [6.5, 8.5], turbidity: 1, lead: 0.015, bacteria: 0 },
    WHO: { pH: [6.5, 8.5], turbidity: 5, lead: 0.01, bacteria: 0 },
  };
  return standards[country] || standards.CN;
}

function compareWithStandards(data: any, standards: any) {
  const details = [];
  let drinkable = true;

  for (const key in data) {
    const value = data[key];
    const standard = standards[key];
    
    let pass = true;
    if (Array.isArray(standard)) {
      pass = value >= standard[0] && value <= standard[1];
    } else {
      pass = value <= standard;
    }

    if (!pass) drinkable = false;
    
    details.push({
      indicator: key,
      value,
      standard,
      pass,
    });
  }

  return { drinkable, details };
}

async function getAIAnalysis(data: any, comparison: any, country: string) {
  const prompt = `你是一位水质分析专家。根据以下水质检测数据和标准比对结果，生成简明的分析报告。

检测数据：
${JSON.stringify(data, null, 2)}

标准：${country}
比对结果：${comparison.drinkable ? '符合标准' : '部分指标超标'}

请提供：
1. 一段简明的水质安全评估（50字内）
2. 三条具体的净化处理建议

以JSON格式返回：{"summary": "评估内容", "suggestions": ["建议1", "建议2", "建议3"]}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API 调用失败:', error);
    return {
      summary: comparison.drinkable ? '水质各项指标符合标准，可安全饮用。' : '部分指标超标，建议净化后饮用。',
      suggestions: ['使用活性炭过滤器', '安装反渗透净水器', '定期更换滤芯'],
    };
  }
}
