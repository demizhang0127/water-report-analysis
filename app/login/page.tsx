'use client';

import { useEffect, useState } from 'react';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 50%, #0f2027 100%)' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-8 animate-pulse" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', boxShadow: '0 0 40px rgba(14,165,233,0.4)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            水质报告 <span style={{ background: 'linear-gradient(90deg, #38bdf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI 分析</span>
          </h1>
          <p className="text-slate-400 text-sm">登录后即可上传水质报告，获得专业 AI 评估</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl p-px" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(6,182,212,0.1))' }}>
          <div className="rounded-3xl p-8 text-center" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)' }}>
            <p className="text-slate-400 text-sm mb-6">使用 Google 账号安全登录</p>

            <a
              href="/api/auth/login"
              className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'white', color: '#1f2937' }}
            >
              {/* Google SVG logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </a>

            <p className="text-slate-600 text-xs mt-5">登录即表示您同意我们的服务条款和隐私政策</p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Powered by Gemini AI · 支持 PDF、图片、Word、Excel
        </p>
      </div>
    </main>
  );
}
