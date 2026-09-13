import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Calculator, Lock, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { MarketMetrics } from '../types/market';
import { evaluateIntradayScale, evaluateMacroScale } from '../utils/quantEngine';

interface CashCalculatorProps {
  metrics: MarketMetrics;
}

export const CashAllocationCalculator: React.FC<CashCalculatorProps> = ({ metrics }) => {
  const [totalCapital, setTotalCapital] = useState<number>(100000); // default $100,000
  const [currency, setCurrency] = useState<'USD' | 'KRW'>('USD');

  const intraday = evaluateIntradayScale(metrics);
  const macro = evaluateMacroScale(metrics);

  const targetCashPercent = Math.max(intraday.recommendedCashPercent, macro.recommendedCashPercent);
  const maxEquityPercent = 100 - targetCashPercent;

  const cashAmount = (totalCapital * targetCashPercent) / 100;
  const maxEquityAmount = (totalCapital * maxEquityPercent) / 100;

  // 1st Tranche is generally 10% of total portfolio or half of available equity
  const firstTrancheAmount = maxEquityAmount > 0 ? (totalCapital * Math.min(15, maxEquityPercent)) / 100 : 0;
  const reserveTrancheAmount = Math.max(0, maxEquityAmount - firstTrancheAmount);

  const formatMoney = (val: number) => {
    if (currency === 'USD') {
      return `$${Math.round(val).toLocaleString('en-US')}`;
    }
    return `${Math.round(val * 1350).toLocaleString('ko-KR')}원`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-100 text-base md:text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>🛡️ 4. 퀀트 자산 배분 & 행동 지침 계산기 (기본 현금 80%+ 엄수)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            자산 보호가 최우선입니다. 감정에 휘둘리지 않고 사전 정의된 분할 매수 규칙만 집행합니다.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded-lg transition-all ${
              currency === 'USD' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('KRW')}
            className={`px-3 py-1 rounded-lg transition-all ${
              currency === 'KRW' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            KRW (원)
          </button>
        </div>
      </div>

      {/* Inputs & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            총 운용 자산 설정
          </label>
          <div className="relative">
            <input
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-extrabold text-lg mono-num focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">
              {currency}
            </span>
          </div>

          <div className="flex gap-1.5 pt-1">
            {[50000, 100000, 300000, 500000].map((v) => (
              <button
                key={v}
                onClick={() => setTotalCapital(v)}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-400 hover:text-white"
              >
                ${v / 1000}k
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900">
            현재 퀀트 진단: <strong className="text-emerald-400">{intraday.koreanTitle}</strong>
          </div>
        </div>

        {/* Calculated Cash Allocation Ratio */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              권장 방어 현금 (최소 80%+)
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {targetCashPercent}%
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mono-num">
            {formatMoney(cashAmount)}
          </div>
          <p className="text-xs text-slate-400">
            • 하락장 충격 흡수용 무위험 안전 현금<br />
            • MMF / SGOV / 달러 예수금 보관 필수
          </p>
        </div>

        {/* Execution Tranche Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1차 분할 매수 실행 한도
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
              {maxEquityPercent > 0 ? `${Math.min(15, maxEquityPercent)}%` : '0% (매수 금지)'}
            </span>
          </div>
          <div className="text-2xl font-black text-teal-300 mono-num">
            {formatMoney(firstTrancheAmount)}
          </div>
          <p className="text-xs text-slate-400">
            {intraday.step <= 2
              ? '⚠️ 현재는 절대 매수 금지 구간입니다.'
              : intraday.step === 3
              ? '🔍 바닥 후보 구간: 5% 미만 소액 타진만 고려.'
              : '🎯 1차 안전 분할 매수 적기: 당일 저가 손절 원칙.'}
          </p>
        </div>
      </div>

      {/* Action Order Box */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
            퀀트 트레이더 최종 행동 명령서
          </span>
          <p className="text-sm font-bold text-slate-100">
            "{intraday.actionGuide}"
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            바닥을 예언하려 하지 마십시오. 감정적인 공포에 투매하지 말고, 포모(FOMO)로 인한 섣부른 추격 매수를 엄금합니다.
            오직 객관적인 거래량 폭증, VIX 피크아웃, FTD 확인 룰에 의해서만 분할 진입하십시오.
          </p>
        </div>
      </div>
    </div>
  );
};
