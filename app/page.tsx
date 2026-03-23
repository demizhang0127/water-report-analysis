'use client';

import { useState } from 'react';

const countries = [
  { code: 'WHO', name: 'WHO国际标准' },
  { code: 'CN', name: '中国GB标准' },
  { code: 'US', name: '美国EPA标准' },
];

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('CN');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', selectedCountry);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          水质报告分析
        </h1>
        <p className="text-center text-gray-600 mb-8">
          上传水质报告，即刻获得专业分析
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择标准
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传报告
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              支持 PDF、图片、Excel、Word 格式
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">分析结果</h2>
            
            <div className={`p-4 rounded-lg mb-6 ${result.drinkable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-lg font-semibold">
                {result.drinkable ? '✓ 水质符合饮用标准' : '✗ 水质不符合饮用标准'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">AI 解读</h3>
              <p className="text-gray-700 whitespace-pre-line">{result.analysis}</p>
            </div>

            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">净化建议</h3>
                <div className="space-y-2">
                  {result.suggestions.map((s: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg ${i === 0 ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                      <p>{i + 1}. {i === 0 ? s : '🔒 付费解锁更多建议'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
