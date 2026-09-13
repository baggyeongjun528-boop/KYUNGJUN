import React from 'react';
import { RefreshCw, Pause, Play, Clock, ShieldCheck, Moon } from 'lucide-react';

interface LiveStreamingBarProps {
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshIntervalSec: number;
  onChangeInterval: (sec: number) => void;
  secondsRemaining: number;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  lastUpdatedTime: string;
  session?: 'REGULAR' | 'PRE_MARKET' | 'POST_MARKET' | 'CLOSED';
}

export const LiveStreamingBar: React.FC<LiveStreamingBarProps> = ({
  isAutoRefresh,
  onToggleAutoRefresh,
  refreshIntervalSec,
  onChangeInterval,
  secondsRemaining,
  isRefreshing,
  onManualRefresh,
  lastUpdatedTime,
  session = 'CLOSED',
}) => {
  const intervals = [5, 10, 30];

  const sessionInfo = {
    REGULAR: { text: '정규장 실시간 거래 중', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    PRE_MARKET: { text: '프리마켓 거래 중', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    POST_MARKET: { text: '애프터마켓 거래 중', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    CLOSED: { text: '미 증시 휴장 (마감가 유지)', color: 'text-slate-400 bg-slate-800/80 border-slate-700/60' },
  }[session];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Streaming Status & Live Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {session === 'REGULAR' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : session === 'CLOSED' ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500" />
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              )}
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${sessionInfo.color}`}>
              {session === 'CLOSED' ? <Moon className="w-3 h-3 text-slate-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
              {sessionInfo.text}
            </span>
          </div>

          {/* Countdown timer */}
          {isAutoRefresh && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300 mono-num text-[11px]">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>
                다음 동기화: <strong className="text-emerald-400">{secondsRemaining}초</strong> 후
              </span>
            </div>
          )}

          {/* Last updated timestamp */}
          <span className="hidden md:inline text-slate-400 text-[11px] mono-num">
            동기화 수신: <span className="text-slate-300">{lastUpdatedTime || '동기화 완료'}</span>
          </span>
        </div>

        {/* Right: Controls (Interval select, manual trigger) */}
        <div className="flex items-center gap-2">
          {session === 'CLOSED' && (
            <span className="hidden lg:inline text-[11px] text-slate-500">
              *주말/휴장 중에는 공식 최종 마감가가 유지됩니다
            </span>
          )}

          {/* Interval selector buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {intervals.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  onChangeInterval(sec);
                  if (!isAutoRefresh) onToggleAutoRefresh();
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isAutoRefresh && refreshIntervalSec === sec
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}초
              </button>
            ))}
            <button
              onClick={onToggleAutoRefresh}
              title={isAutoRefresh ? '자동 동기화 정지' : '자동 동기화 재개'}
              className={`p-1 rounded text-[11px] transition-all ml-0.5 ${
                !isAutoRefresh
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAutoRefresh ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          {/* Manual Refresh Now Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-emerald-950/40"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '수신중...' : '지금 갱신'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
