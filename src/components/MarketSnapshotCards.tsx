import React from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign, BarChart2, ShieldAlert, Zap, Layers } from 'lucide-react';
import { MarketMetrics } from '../types/market';

interface MarketSnapshotCardsProps {
  metrics: MarketMetrics;
}

export const MarketSnapshotCards: React.FC<MarketSnapshotCardsProps> = ({ metrics }) => {
  const formatNum = (num: number, digits = 2) =>
    num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const renderDelta = (change: number, pct: number, isPercentPoint = false) => {
    const isUp = change >= 0;
    return (
      <span
        className={`flex items-center gap-0.5 text-xs font-bold mono-num ${
          isUp ? 'text-emerald-400' : 'text-rose-400'
        }`}
      >
        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {isUp ? '+' : ''}
        {formatNum(change)} ({isUp ? '+' : ''}
        {formatNum(pct)}
        {isPercentPoint ? '%p' : '%'})
      </span>
    );
  };

  const cards = [
    {
      label: 'S&P 500',
      symbol: '^GSPC',
      price: formatNum(metrics.sp500.price),
      change: metrics.sp500.change,
      changePct: metrics.sp500.changePercent,
      tag: metrics.sp500.above20dma ? '20DMA 상회' : '20DMA 하회',
      tagColor: metrics.sp500.above20dma ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
    },
    {
      label: 'Nasdaq 100',
      symbol: '^NDX',
      price: formatNum(metrics.nasdaq100.price),
      change: metrics.nasdaq100.change,
      changePct: metrics.nasdaq100.changePercent,
      tag: `고점대비 ${metrics.nasdaq100.dropFromHighPercent?.toFixed(1) ?? '0'}%`,
      tagColor: (metrics.nasdaq100.dropFromHighPercent ?? 0) <= -15 ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      label: 'SPY ETF',
      symbol: 'SPY',
      price: `$${formatNum(metrics.spy.price)}`,
      change: metrics.spy.change,
      changePct: metrics.spy.changePercent,
      tag: metrics.spy.aboveVwap ? 'VWAP 상회' : 'VWAP 하회',
      tagColor: metrics.spy.aboveVwap ? 'text-teal-400 bg-teal-500/10' : 'text-amber-400 bg-amber-500/10',
    },
    {
      label: 'QQQ ETF',
      symbol: 'QQQ',
      price: `$${formatNum(metrics.qqq.price)}`,
      change: metrics.qqq.change,
      changePct: metrics.qqq.changePercent,
      tag: `RSI(14): ${metrics.qqq.rsi14.toFixed(1)}`,
      tagColor: metrics.qqq.rsi14 < 30 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      label: 'CBOE VIX',
      symbol: '^VIX',
      price: formatNum(metrics.vix.current),
      change: metrics.vix.change,
      changePct: metrics.vix.changePercent,
      tag: metrics.vix.isPeakedOut ? '피크아웃 확인' : '상승 압력 지속',
      tagColor: metrics.vix.isPeakedOut ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
      highlight: metrics.vix.current >= 30,
    },
    {
      label: '미 국채 10년물',
      symbol: 'US10Y',
      price: `${formatNum(metrics.us10yYield.current, 3)}%`,
      change: metrics.us10yYield.change,
      changePct: (metrics.us10yYield.change / metrics.us10yYield.current) * 100,
      tag: metrics.us10yYield.change < 0 ? '금리 하락 안정' : '금리 상승 압력',
      tagColor: metrics.us10yYield.change < 0 ? 'text-teal-400 bg-teal-500/10' : 'text-orange-400 bg-orange-500/10',
    },
    {
      label: '달러 인덱스 (DXY)',
      symbol: 'DXY',
      price: formatNum(metrics.dollarIndexDxy.current),
      change: metrics.dollarIndexDxy.change,
      changePct: (metrics.dollarIndexDxy.change / metrics.dollarIndexDxy.current) * 100,
      tag: metrics.dollarIndexDxy.current > 105 ? '달러 강세 부담' : '달러 안정',
      tagColor: metrics.dollarIndexDxy.current > 105 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      label: '하이일드 스프레드',
      symbol: 'HY OAS',
      price: `${metrics.highYieldOas.current} bps`,
      change: metrics.highYieldOas.isWidening ? 15 : -12,
      changePct: metrics.highYieldOas.isWidening ? 3.8 : -3.1,
      tag: metrics.highYieldOas.isStabilizing ? '신용 안정화' : '신용 위험 확대',
      tagColor: metrics.highYieldOas.isStabilizing ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200">
            ⏱️ 1. 실시간 미국 증시 & 거시 매크로 스냅샷
          </h3>
        </div>
        <span className="text-xs text-slate-500 mono-num">
          선물: ES {metrics.esFutures.price.toFixed(1)} / NQ {metrics.nqFutures.price.toFixed(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border bg-slate-900/80 transition-all hover:border-slate-700 ${
              c.highlight
                ? 'border-rose-500/50 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-medium text-slate-400">{c.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.tagColor}`}>
                {c.tag}
              </span>
            </div>
            <div className="text-base font-extrabold text-white mono-num mb-1">
              {c.price}
            </div>
            <div>{renderDelta(c.change, c.changePct)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
