'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { WATER_STANDARDS, REGIONS } from '@/lib/standards';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
  userType?: string;
  maxSuggestions?: number;
}

const steps = ['上传报告', 'AI 解析', '生成报告'];

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('CN');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (inputMode === 'file' && !file) return;
    if (inputMode === 'text' && !textInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 1800);

    const formData = new FormData();
    formData.append('country', selectedCountry);
    formData.append('mode', inputMode);

    if (inputMode === 'file' && file) {
      formData.append('file', file);
    } else {
      formData.append('text', textInput);
    }

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || '分析失败，请重试');
      } else {
        setResult(data);
      }
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const canSubmit = inputMode === 'file' ? !!file : textInput.trim().length > 10;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const selectedStandard = WATER_STANDARDS[selectedCountry];

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 50%, #0f2027 100%)' }}>
      {/* Auth loading state — hidden once checked */}
      {!authChecked && (
        <div className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      {/* 用户信息栏 */}
      {authChecked && (
        <div className="absolute top-0 right-0 z-20 flex items-center gap-3 px-5 py-3">
          {user ? (
            <>
              {user.picture && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-slate-600" referrerPolicy="no-referrer" />
              )}
              <span className="text-slate-300 text-sm hidden sm:block">{user.name}</span>
              <a href="/api/auth/logout" className="text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 hover:border-slate-500 rounded-lg px-2.5 py-1">
                退出
              </a>
            </>
          ) : (
            <a href="/api/auth/login" className="flex items-center gap-2 text-xs font-medium text-white transition-all rounded-lg px-3 py-1.5 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google 登录
            </a>
          )}
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-8 animate-pulse" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', boxShadow: '0 0 40px rgba(14,165,233,0.4)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            水质报告 <span style={{ background: 'linear-gradient(90deg, #38bdf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI 分析</span>
          </h1>
          <p className="text-slate-400 text-lg">上传水质报告或输入检测数据，秒级获得专业安全评估</p>
          <div className="flex items-center justify-center gap-6 mt-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />即时分析</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />全球标准</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />AI 驱动</span>
          </div>
        </div>

        {/* 主卡片 */}
        <div className="rounded-3xl p-px mb-6" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(6,182,212,0.1), rgba(56,189,248,0.05))' }}>
          <div className="rounded-3xl p-8" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)' }}>

            {/* 国家/标准选择 */}
            <div className="mb-7">
              <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">选择评估标准</label>
              <div className="space-y-3">
                {REGIONS.map(region => (
                  <div key={region.label}>
                    <div className="text-xs text-slate-600 mb-2 font-medium">{region.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {region.codes.map(code => {
                        const s = WATER_STANDARDS[code];
                        const isSelected = selectedCountry === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setSelectedCountry(code)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 cursor-pointer"
                            style={isSelected ? {
                              background: 'rgba(14,165,233,0.25)',
                              borderColor: '#38bdf8',
                              color: '#e0f2fe',
                              boxShadow: '0 0 12px rgba(14,165,233,0.2)'
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#94a3b8'
                            }}
                          >
                            <span>{s.flag}</span>
                            <span>{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* 选中标准详情 */}
              {selectedStandard && (
                <div className="mt-3 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
                  <span className="text-2xl">{selectedStandard.flag}</span>
                  <div>
                    <span className="text-sky-400 font-medium text-sm">{selectedStandard.standard}</span>
                    <span className="text-slate-500 text-xs ml-2">· {selectedStandard.authority}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 输入模式切换 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">输入方式</label>
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => { setInputMode('file'); setResult(null); setError(null); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={inputMode === 'file' ? { background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: 'white' } : { color: '#94a3b8' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  上传文件
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('text'); setResult(null); setError(null); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={inputMode === 'text' ? { background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: 'white' } : { color: '#94a3b8' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  文字描述
                </button>
              </div>
            </div>

            {/* 文件上传 */}
            {inputMode === 'file' && (
              <div className="mb-7">
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300"
                  style={dragging ? { borderColor: '#0ea5e9', background: 'rgba(14,165,233,0.1)' }
                    : file ? { borderColor: 'rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.05)' }
                    : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <input id="file-upload" ref={fileInputRef} type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    className="sr-only"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(14,165,233,0.15)' }}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-emerald-400 text-sm font-medium">文件已选择</span>
                        </div>
                        <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{formatFileSize(file.size)}</p>
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); setFile(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="text-xs text-sky-400 hover:text-sky-300 mt-1.5 underline underline-offset-2 transition-colors">
                          更换文件
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-slate-300 font-medium mb-1">拖拽文件到此处，或点击选择</p>
                      <p className="text-slate-500 text-sm">支持 PDF、图片（JPG/PNG）、Word、Excel</p>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* 文字输入 */}
            {inputMode === 'text' && (
              <div className="mb-7">
                <textarea
                  value={textInput}
                  onChange={(e) => { setTextInput(e.target.value); setResult(null); setError(null); }}
                  placeholder="请输入水质检测数据或描述，例如：&#10;pH值: 7.2，浊度: 0.8 NTU，铅含量: 0.005 mg/L，细菌总数: 50 CFU/mL，余氯: 0.3 mg/L，总硬度: 180 mg/L..."
                  rows={6}
                  className="w-full rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', lineHeight: '1.7' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-slate-600 text-xs">支持中英文描述，输入检测指标和数值即可</p>
                  <p className={`text-xs ${textInput.length > 10 ? 'text-emerald-400' : 'text-slate-600'}`}>{textInput.length} 字</p>
                </div>
              </div>
            )}

            {/* 分析按钮 */}
            <button
              onClick={handleUpload}
              disabled={!canSubmit || loading}
              type="button"
              className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-300"
              style={!canSubmit || loading ? {
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed'
              } : {
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                boxShadow: '0 0 30px rgba(14,165,233,0.4)',
                cursor: 'pointer'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  AI 正在分析…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  开始 AI 分析
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 加载进度 */}
        {loading && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <div className="flex items-center gap-3 mb-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                    style={i <= loadingStep ? { background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: 'white' } : { background: 'rgba(255,255,255,0.06)', color: '#475569' }}>
                    {i < loadingStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs" style={{ color: i <= loadingStep ? '#38bdf8' : '#475569' }}>{step}</span>
                  {i < steps.length - 1 && <div className="w-6 h-px" style={{ background: i < loadingStep ? '#0ea5e9' : 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((loadingStep + 1) / steps.length) * 100}%`, background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }} />
            </div>
          </div>
        )}

        {/* 错误 */}
        {error && (
          <div className="rounded-2xl p-5 mb-6 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-red-400 font-medium">分析失败</p>
              <p className="text-red-300/70 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* 分析结果 */}
        {result && (
          <div className="space-y-4">
            {/* 所用标准 */}
            {result.standard && (
              <div className="rounded-xl px-4 py-2 flex items-center gap-2 text-sm" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <span>{selectedStandard?.flag}</span>
                <span className="text-slate-400">评估依据：</span>
                <span className="text-sky-400 font-medium">{result.standard.name} · {result.standard.code}</span>
                <span className="text-slate-600 text-xs ml-1">({result.standard.authority})</span>
              </div>
            )}

            {/* 主结论 */}
            <div className="rounded-2xl p-6" style={result.drinkable ? {
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
              border: '1px solid rgba(16,185,129,0.3)'
            } : {
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
              border: '1px solid rgba(239,68,68,0.3)'
            }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: result.drinkable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                  {result.drinkable ? (
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: result.drinkable ? '#34d399' : '#f87171' }}>综合评定</div>
                  <div className="text-xl font-bold text-white">{result.drinkable ? '✅ 水质符合饮用标准' : '⚠️ 水质不符合饮用标准'}</div>
                </div>
              </div>
            </div>

            {/* 指标详情 */}
            {result.indicators?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  指标对比
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {result.indicators.map((ind: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: ind.pass ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${ind.pass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs">{ind.name}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ind.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{ind.pass ? '✓ 达标' : '✗ 超标'}</span>
                      </div>
                      <div className="text-white font-semibold">{ind.value}</div>
                      <div className="text-slate-500 text-xs mt-0.5">标准: {ind.standard}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 解读 */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                AI 专业解读
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">{result.analysis}</p>
            </div>

            {/* 净化建议 */}
            {result.suggestions?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  净化处理建议
                </h3>
                <div className="space-y-2">
                  {result.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all"
                      style={i === 0 ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.45 }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={i === 0 ? { background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: 'white' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                        {i + 1}
                      </div>
                      <span className={`text-sm ${i === 0 ? 'text-slate-200' : 'text-slate-600 select-none'}`}>
                        {i === 0 ? s : '🔒 升级解锁更多专业建议'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setFile(null); setTextInput(''); setResult(null); setError(null); }}
              type="button"
              className="w-full py-3 rounded-xl text-slate-400 text-sm hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              重新分析
            </button>
          </div>
        )}

        <div className="mt-10 text-center text-slate-600 text-xs space-y-1">
          <p>上传文件仅用于本次分析，不会被存储</p>
          <p>Powered by Gemini AI · 支持 PDF、图片、Word、Excel 格式</p>
        </div>
      </div>
    </main>
  );
}
