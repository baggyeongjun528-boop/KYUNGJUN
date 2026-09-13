import React from 'react';
import { Radio, RefreshCw, Pause, Play, Clock, Sparkles } from 'lucide-react';

interface LiveStreamingBarProps {
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshIntervalSec: number;
  onChangeInterval: (sec: number) => void;
  secondsRemaining: number;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  lastUpdatedTime: string;
  enableMicroTicks: boolean;
  onToggleMicroTicks: () => void;
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
  enableMicroTicks,
  onToggleMicroTicks,
}) => {
  const intervals = [5, 10, 30];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Streaming Status & Live Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isAutoRefresh ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500" />
              )}
            </span>
            <span className="font-bold tracking-wide flex items-center gap-1">
              <span className={isAutoRefresh ? 'text-emerald-400' : 'text-slate-400'}>
                {isAutoRefresh ? '실시간 라이브 피드 가동' : '실시간 피드 일시정지'}
              </span>
            </span>
          </div>

          {/* Countdown timer */}
          {isAutoRefresh && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300 mono-num text-[11px]">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>
                다음 갱신: <strong className="text-emerald-400">{secondsRemaining}초</strong> 후
              </span>
            </div>
          )}

          {/* Last updated timestamp */}
          <span className="hidden md:inline text-slate-400 text-[11px] mono-num">
            최종 수신: <span className="text-slate-300">{lastUpdatedTime || '동기화 완료'}</span>
          </span>
        </div>

        {/* Right: Controls (Interval select, micro tick toggle, manual trigger) */}
        <div className="flex items-center gap-2">
          {/* Micro ticks toggle */}
          <button
            onClick={onToggleMicroTicks}
            title={
              enableMicroTicks
                ? '장외/휴장 시간대에도 미세 틱 호가 변동을 시각화합니다 (활성)'
                : '미세 틱 시각화 끄기'
            }
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-all ${
              enableMicroTicks
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>실시간 호가 틱 {enableMicroTicks ? 'ON' : 'OFF'}</span>
          </button>

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
              title={isAutoRefresh ? '자동 갱신 정지' : '자동 갱신 시작'}
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
