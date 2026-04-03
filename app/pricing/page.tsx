'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/useLanguage';

export default function Pricing() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (plan: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      
      const data = await res.json();
      
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert('Payment creation failed. Please try again.');
      }
    } catch (error) {
      alert('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 50%, #0f2027 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t.pricingTitle}</h1>
          <p className="text-slate-400 text-lg">{t.pricingSubtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Single Purchase */}
          <div className="rounded-2xl p-8 border-2 border-slate-700 hover:border-sky-500/50 transition-all">
            <div className="text-slate-400 text-sm mb-2">{t.singleReport}</div>
            <div className="text-4xl font-bold text-white mb-1">$0.99</div>
            <div className="text-slate-500 text-sm mb-6">{t.oneTime}</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1 {t.reportAnalysis}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.fullSuggestions}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.allStandards}
              </li>
            </ul>
            <button onClick={() => handlePurchase('single')} disabled={loading} className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors disabled:opacity-50">
              {loading ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.purchase}
            </button>
          </div>

          {/* Package */}
          <div className="rounded-2xl p-8 border-2 border-purple-500 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
              {t.recommended}
            </div>
            <div className="text-slate-400 text-sm mb-2">{t.package}</div>
            <div className="text-4xl font-bold text-white mb-1">$2.99</div>
            <div className="text-slate-500 text-sm mb-6">5 {t.reports} + {t.unlimitedStandards}</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                5 {t.reportAnalyses}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.fullSuggestions}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.unlimitedStandards}
              </li>
            </ul>
            <button onClick={() => handlePurchase('package')} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}>
              {loading ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.purchase}
            </button>
          </div>

          {/* Subscription */}
          <div className="rounded-2xl p-8 border-2 border-sky-500/50 hover:border-sky-500 transition-all">
            <div className="text-slate-400 text-sm mb-2">{t.subscription}</div>
            <div className="text-4xl font-bold text-white mb-1">$9.99</div>
            <div className="text-slate-500 text-sm mb-6">60 {t.days} / 50 {t.reports}</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                50 {t.reports} / 60 {t.days}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.fullSuggestions}
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.unlimitedStandards}
              </li>
            </ul>
            <button onClick={() => handlePurchase('subscription')} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
              {loading ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.subscribe}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <a href="/" className="text-slate-400 hover:text-white transition-colors text-sm">{t.backToHome}</a>
        </div>
      </div>
    </main>
  );
}
