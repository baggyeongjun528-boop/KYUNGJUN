import React from 'react';
import { ShieldAlert, Activity, RefreshCw, Bell, Volume2, VolumeX, Copy, Sliders, Smartphone, Monitor } from 'lucide-react';
import { MarketMetrics } from '../types/market';

interface HeaderProps {
  metrics: MarketMetrics;
  onRefresh: () => void;
  onOpenReport: () => void;
  onOpenSimulator: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onRefresh,
  onOpenReport,
  onOpenSimulator,
  soundEnabled,
  onToggleSound,
  isMobileFrame,
  onToggleMobileFrame,
  unreadAlertsCount,
  onOpenAlerts,
  isRefreshing = false,
}) => {
  const sessionBadge = {
    REGULAR: { text: '장중 실시간', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    PRE_MARKET: { text: '프리마켓', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    POST_MARKET: { text: '애프터마켓', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    CLOSED: { text: '직전 마감 기준', color: 'bg-slate-700/50 text-slate-300 border-slate-600/40' },
  }[metrics.session];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/30 text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 text-base md:text-lg tracking-tight flex items-center gap-1.5">
                Quant Bottom Monitor
                <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                  미국 증시 퀀트 바닥 감시
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mono-num">
              <span className={`px-1.5 py-0.5 rounded border text-[11px] font-semibold ${sessionBadge.color}`}>
                {sessionBadge.text}
              </span>
              <span>KST {metrics.timestampKst}</span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline">EST {metrics.timestampEst}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Audio Chime */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '알림 효과음 끄기' : '알림 효과음 켜기'}
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1 ${
              soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Alerts Center */}
          <button
            onClick={onOpenAlerts}
            title="실시간 알림 로그"
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Scenario & Sim Tuning */}
          <button
            onClick={onOpenSimulator}
            title="시나리오 리플레이 & 파라미터 튜닝"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">시나리오</span>
          </button>

          {/* 4-Section Report Generator Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>4섹션 리포트</span>
          </button>

          {/* Mobile frame toggle (for testing responsive layout) */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? '와이드 뷰로 전환' : '모바일 프레임으로 전환'}
            className="hidden lg:flex items-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="최신 시장 데이터 실시간 동기화"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? '갱신중...' : '최신 갱신'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
