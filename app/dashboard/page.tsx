'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/useLanguage';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
  userType: string;
  subscriptionEndDate?: number;
  remainingCredits: number;
  canSwitchStandards: boolean;
}

export default function Dashboard() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (plan: string) => {
    setPurchasing(true);
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
      setPurchasing(false);
    }
  };

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/');
        } else {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 50%, #0f2027 100%)' }}>
        <svg className="animate-spin h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const getUserTypeLabel = () => {
    if (user.userType === 'subscription') return t.subscription;
    if (user.userType === 'pay_per_use') return t.payPerUse;
    return t.freeUser;
  };

  const getUserTypeBadge = () => {
    if (user.userType === 'subscription') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: 'white' }}>💎 订阅会员</span>;
    }
    if (user.userType === 'pay_per_use') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">💳 按次付费</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">免费用户</span>;
  };

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 50%, #0f2027 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{t.personalCenter}</h1>
          <a href="/" className="text-slate-400 hover:text-white transition-colors text-sm">{t.backToHome}</a>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
          <div className="flex items-center gap-4">
            {user.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full border-2 border-sky-500/30" referrerPolicy="no-referrer" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                {getUserTypeBadge()}
              </div>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Credits */}
          <div className="rounded-xl p-5" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
            <div className="text-slate-400 text-sm mb-2">{t.remainingCredits}</div>
            <div className="text-3xl font-bold text-white">
              {user.userType === 'subscription' ? '∞' : user.remainingCredits}
            </div>
          </div>

          {/* Subscription */}
          {user.subscriptionEndDate && (
            <div className="rounded-xl p-5" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
              <div className="text-slate-400 text-sm mb-2">{t.subscriptionExpiry}</div>
              <div className="text-lg font-semibold text-white">
                {new Date(user.subscriptionEndDate).toLocaleDateString('zh-CN')}
              </div>
            </div>
          )}

          {/* Standards */}
          <div className="rounded-xl p-5" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
            <div className="text-slate-400 text-sm mb-2">{t.standardSwitch}</div>
            <div className="text-lg font-semibold text-white">
              {user.canSwitchStandards ? `✅ ${t.unlimited}` : `❌ ${t.limited}`}
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(56,189,248,0.12)' }}>
          <h3 className="text-xl font-semibold text-white mb-4">{t.upgradePlans}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Single */}
            <div className="rounded-xl p-5 border-2 border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer">
              <div className="text-slate-400 text-sm mb-2">{lang === 'zh' ? '按次购买' : 'Pay Per Use'}</div>
              <div className="text-3xl font-bold text-white mb-1">$0.99</div>
              <div className="text-slate-500 text-xs mb-4">{lang === 'zh' ? '单次解锁' : 'Single unlock'}</div>
              <button onClick={() => handlePurchase('single')} disabled={purchasing} className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors disabled:opacity-50">
                {purchasing ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.purchase}
              </button>
            </div>

            {/* Package */}
            <div className="rounded-xl p-5 border-2 border-purple-500/50 hover:border-purple-500 transition-all cursor-pointer relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                {t.recommended}
              </div>
              <div className="text-slate-400 text-sm mb-2">{t.package}</div>
              <div className="text-3xl font-bold text-white mb-1">$2.99</div>
              <div className="text-slate-500 text-xs mb-4">5 {t.reports} + {t.unlimitedStandards}</div>
              <button onClick={() => handlePurchase('package')} disabled={purchasing} className="w-full py-2 rounded-lg text-white text-sm transition-colors disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}>
                {purchasing ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.purchase}
              </button>
            </div>

            {/* Subscription */}
            <div className="rounded-xl p-5 border-2 border-sky-500/50 hover:border-sky-500 transition-all cursor-pointer">
              <div className="text-slate-400 text-sm mb-2">{lang === 'zh' ? '订阅制' : 'Subscription'}</div>
              <div className="text-3xl font-bold text-white mb-1">$9.99</div>
              <div className="text-slate-500 text-xs mb-4">60 {t.days} / 50 {t.reports}</div>
              <button onClick={() => handlePurchase('subscription')} disabled={purchasing} className="w-full py-2 rounded-lg text-white text-sm transition-colors disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                {purchasing ? (lang === 'zh' ? '处理中...' : 'Processing...') : t.subscribe}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
