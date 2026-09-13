import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ChevronRight, Info, Compass, Target, ArrowRight } from 'lucide-react';
import { MarketMetrics } from '../types/market';
import { evaluateIntradayScale, evaluateMacroScale } from '../utils/quantEngine';

interface BottomScaleGaugeProps {
  metrics: MarketMetrics;
}

export const BottomScaleGauge: React.FC<BottomScaleGaugeProps> = ({ metrics }) => {
  const intraday = evaluateIntradayScale(metrics);
  const macro = evaluateMacroScale(metrics);
  const [activeTab, setActiveTab] = useState<'intraday' | 'macro'>('intraday');

  const intradaySteps = [
    { step: 1, name: '1. 투매 진행', desc: '절대 매수 금지 (현금 100%)', color: 'rose' },
    { step: 2, name: '2. 하락 둔화', desc: '매도세 진정, 관망 준비', color: 'orange' },
    { step: 3, name: '3. 바닥 후보', desc: '장중 저점 방어, VIX 피크아웃', color: 'amber' },
    { step: 4, name: '4. 바닥 확인', desc: 'FTD 발생, 1차 분할 매수', color: 'teal' },
    { step: 5, name: '5. 반등 지속', desc: '이평선 회복, 눌림목 공략', color: 'emerald' },
  ];

  const macroSteps = [
    { step: 1, name: '신고점', prob: 0, sub: '극단적 탐욕' },
    { step: 2, name: '고점 횡보', prob: 5, sub: '모멘텀 둔화' },
    { step: 3, name: '1차 눌림', prob: 10, sub: '-3%~-5%' },
    { step: 4, name: '단기 조정', prob: 15, sub: '50DMA 이탈' },
    { step: 5, name: '중기 조정', prob: 25, sub: '-7%~-10%' },
    { step: 6, name: '200선 터치', prob: 40, sub: '생명선 위협' },
    { step: 7, name: '패닉 충격', prob: 60, sub: '200선 붕괴' },
    { step: 8, name: '항복 투매', prob: 75, sub: '클라이맥스' },
    { step: 9, name: '기술적 탈출', prob: 85, sub: 'FTD 확정' },
    { step: 10, name: '역사적 찐바닥', prob: 95, sub: '2025.04.07형' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient based on urgency */}
      <div
        className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          intraday.step === 1 ? 'bg-rose-500' :
          intraday.step === 4 || macro.step >= 9 ? 'bg-emerald-500' :
          macro.step === 10 ? 'bg-purple-500' : 'bg-amber-500'
        }`}
      />

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-slate-100 text-lg md:text-xl tracking-tight">
              핵심 바닥 판정 2대 기준
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            감정을 철저히 배제한 퀀트 알고리즘 실시간 판정
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('intraday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'intraday'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>장중 5단계 ({intraday.step}단계)</span>
          </button>
          <button
            onClick={() => setActiveTab('macro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'macro'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>거시 10단계 ({macro.step}단계)</span>
          </button>
        </div>
      </div>

      {/* Intraday Bottom Scale View */}
      {activeTab === 'intraday' && (
        <div className="space-y-4">
          {/* Active Highlight Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${intraday.badgeColor}`}>
                  {intraday.koreanTitle}
                </span>
                <span className="text-xs text-slate-400">장중 감시 진단</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {intraday.summary}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>행동 지침: {intraday.actionGuide}</span>
              </div>
            </div>

            {/* Cash allocation chip */}
            <div className="flex flex-col items-start md:items-end justify-center bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">장중 권장 현금 비중</span>
              <span className="text-xl font-extrabold text-emerald-400 mono-num">
                {intraday.recommendedCashPercent}% 이상
              </span>
              <span className="text-[10px] text-slate-500">원칙: 기본 80%+ 엄수</span>
            </div>
          </div>

          {/* 5-Step Visual Stepper */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-2 pt-1">
            {intradaySteps.map((s) => {
              const isCurrent = s.step === intraday.step;
              const isPast = s.step < intraday.step;
              return (
                <div
                  key={s.step}
                  className={`flex flex-col p-2 md:p-2.5 rounded-xl border transition-all text-center relative ${
                    isCurrent
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800/60 text-slate-500'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950'
                          : isPast
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {s.step}
                    </span>
                  </div>
                  <span className={`text-[11px] md:text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {s.name}
                  </span>
                  <span className="hidden md:block text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {s.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Validation Checklist */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              장중 바닥 교차 검증 체크리스트
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {intraday.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${c.satisfied ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className={c.satisfied ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Macro Cyclical Bottom Scale View */}
      {activeTab === 'macro' && (
        <div className="space-y-4">
          {/* Active Highlight Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${macro.badgeColor}`}>
                  {macro.koreanTitle}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                  바닥 확률 {macro.bottomProbability}%
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {macro.summary}
              </p>
              {macro.historicalReference && (
                <p className="text-xs text-purple-300 font-medium">
                  역사적 유사 국면: {macro.historicalReference}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>행동 지침: {macro.actionGuide}</span>
              </div>
            </div>

            {/* Macro Cash allocation */}
            <div className="flex flex-col items-start md:items-end justify-center bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">거시 사이클 권장 현금</span>
              <span className="text-xl font-extrabold text-purple-400 mono-num">
                {macro.recommendedCashPercent}%
              </span>
              <span className="text-[10px] text-slate-500">기본 방어 80% 유지</span>
            </div>
          </div>

          {/* 10-Step Graduated Stepper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>1단계 (신고점 / 탐욕 0%)</span>
              <span className="text-purple-400">10단계 (역사적 찐바닥 95%)</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {macroSteps.map((s) => {
                const isCurrent = s.step === macro.step;
                const isReached = s.step <= macro.step;
                return (
                  <div
                    key={s.step}
                    className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-purple-950/80 border-purple-400 shadow-md ring-1 ring-purple-400 text-white'
                        : isReached
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{s.step}단</span>
                    <span className="text-[10px] font-medium truncate w-full">{s.name}</span>
                    <span className="text-[9px] text-slate-400 mono-num">{s.prob}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macro Checklist */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              거시 사이클 바닥 판단 근거
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {macro.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${c.satisfied ? 'text-purple-400' : 'text-slate-600'}`}
                  />
                  <span className={c.satisfied ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
