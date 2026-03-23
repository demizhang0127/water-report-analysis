import { NextRequest, NextResponse } from 'next/server';

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
    
    // 调用 AI 分析
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
  // 实际应调用 OpenAI API
  // 这里返回模拟数据
  
  const summary = comparison.drinkable
    ? '根据检测数据，该水质各项指标均符合饮用水标准，可以安全饮用。'
    : '检测发现部分指标超标，建议进行净化处理后再饮用。';

  const suggestions = [
    '使用活性炭过滤器去除异味和有机物',
    '安装反渗透净水器，有效去除重金属',
    '定期更换滤芯，确保净化效果',
  ];

  return { summary, suggestions };
}
