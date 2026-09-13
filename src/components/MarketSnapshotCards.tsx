import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Layers, Activity } from 'lucide-react';
import { MarketMetrics } from '../types/market';

interface MarketSnapshotCardsProps {
  metrics: MarketMetrics;
  isStreaming?: boolean;
}

export const MarketSnapshotCards: React.FC<MarketSnapshotCardsProps> = ({ metrics, isStreaming = true }) => {
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

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
      id: 'sp500',
      label: 'S&P 500',
      symbol: '^GSPC',
      numericPrice: metrics.sp500.price,
      price: formatNum(metrics.sp500.price),
      change: metrics.sp500.change,
      changePct: metrics.sp500.changePercent,
      tag: metrics.sp500.above20dma ? '20DMA 상회' : '20DMA 하회',
      tagColor: metrics.sp500.above20dma ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
    },
    {
      id: 'nasdaq100',
      label: 'Nasdaq 100',
      symbol: '^NDX',
      numericPrice: metrics.nasdaq100.price,
      price: formatNum(metrics.nasdaq100.price),
      change: metrics.nasdaq100.change,
      changePct: metrics.nasdaq100.changePercent,
      tag: `고점대비 ${metrics.nasdaq100.dropFromHighPercent?.toFixed(1) ?? '0'}%`,
      tagColor: (metrics.nasdaq100.dropFromHighPercent ?? 0) <= -15 ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      id: 'spy',
      label: 'SPY ETF',
      symbol: 'SPY',
      numericPrice: metrics.spy.price,
      price: `$${formatNum(metrics.spy.price)}`,
      change: metrics.spy.change,
      changePct: metrics.spy.changePercent,
      tag: metrics.spy.aboveVwap ? 'VWAP 상회' : 'VWAP 하회',
      tagColor: metrics.spy.aboveVwap ? 'text-teal-400 bg-teal-500/10' : 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'qqq',
      label: 'QQQ ETF',
      symbol: 'QQQ',
      numericPrice: metrics.qqq.price,
      price: `$${formatNum(metrics.qqq.price)}`,
      change: metrics.qqq.change,
      changePct: metrics.qqq.changePercent,
      tag: `RSI(14): ${metrics.qqq.rsi14.toFixed(1)}`,
      tagColor: metrics.qqq.rsi14 < 30 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      id: 'vix',
      label: 'CBOE VIX',
      symbol: '^VIX',
      numericPrice: metrics.vix.current,
      price: formatNum(metrics.vix.current),
      change: metrics.vix.change,
      changePct: metrics.vix.changePercent,
      tag: metrics.vix.isPeakedOut ? '피크아웃 확인' : '상승 압력 지속',
      tagColor: metrics.vix.isPeakedOut ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
      highlight: metrics.vix.current >= 30,
    },
    {
      id: 'us10y',
      label: '미 국채 10년물',
      symbol: 'US10Y',
      numericPrice: metrics.us10yYield.current,
      price: `${formatNum(metrics.us10yYield.current, 3)}%`,
      change: metrics.us10yYield.change,
      changePct: (metrics.us10yYield.change / metrics.us10yYield.current) * 100,
      tag: metrics.us10yYield.change < 0 ? '금리 하락 안정' : '금리 상승 압력',
      tagColor: metrics.us10yYield.change < 0 ? 'text-teal-400 bg-teal-500/10' : 'text-orange-400 bg-orange-500/10',
    },
    {
      id: 'dxy',
      label: '달러 인덱스 (DXY)',
      symbol: 'DXY',
      numericPrice: metrics.dollarIndexDxy.current,
      price: formatNum(metrics.dollarIndexDxy.current),
      change: metrics.dollarIndexDxy.change,
      changePct: (metrics.dollarIndexDxy.change / metrics.dollarIndexDxy.current) * 100,
      tag: metrics.dollarIndexDxy.current > 105 ? '달러 강세 부담' : '달러 안정',
      tagColor: metrics.dollarIndexDxy.current > 105 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800',
    },
    {
      id: 'hyoas',
      label: '하이일드 스프레드',
      symbol: 'HY OAS',
      numericPrice: metrics.highYieldOas.current,
      price: `${metrics.highYieldOas.current} bps`,
      change: metrics.highYieldOas.isWidening ? 15 : -12,
      changePct: metrics.highYieldOas.isWidening ? 3.8 : -3.1,
      tag: metrics.highYieldOas.isStabilizing ? '신용 안정화' : '신용 위험 확대',
      tagColor: metrics.highYieldOas.isStabilizing ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
    },
  ];

  // Watch for price ticks and trigger flash animation
  useEffect(() => {
    const newFlashes: Record<string, 'up' | 'down'> = {};
    let hasChange = false;

    cards.forEach((card) => {
      const prev = prevPricesRef.current[card.id];
      if (prev !== undefined && prev !== card.numericPrice) {
        newFlashes[card.id] = card.numericPrice > prev ? 'up' : 'down';
        hasChange = true;
      }
      prevPricesRef.current[card.id] = card.numericPrice;
    });

    if (hasChange) {
      setFlashStates((curr) => ({ ...curr, ...newFlashes }));
      const timer = setTimeout(() => {
        setFlashStates({});
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [
    metrics.sp500.price,
    metrics.nasdaq100.price,
    metrics.spy.price,
    metrics.qqq.price,
    metrics.vix.current,
    metrics.us10yYield.current,
    metrics.dollarIndexDxy.current,
    metrics.highYieldOas.current,
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200">
            ⏱️ 1. 실시간 미국 증시 & 거시 매크로 스냅샷
          </h3>
          {metrics.session === 'CLOSED' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              휴장 (직전 공식 종가 유지)
            </span>
          ) : isStreaming ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              실시간 틱 반영
            </span>
          ) : null}
        </div>
        <span className="text-xs text-slate-400 mono-num flex items-center gap-1.5">
          <span className="text-slate-500">선물:</span>
          <span>ES {metrics.esFutures.price.toFixed(1)}</span>
          <span className="text-slate-600">/</span>
          <span>NQ {metrics.nqFutures.price.toFixed(1)}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map((c) => {
          const flash = flashStates[c.id];
          return (
            <div
              key={c.id}
              className={`p-3 rounded-xl border bg-slate-900/80 transition-all duration-300 relative overflow-hidden ${
                flash === 'up'
                  ? 'border-emerald-400 ring-2 ring-emerald-500/50 bg-emerald-950/30'
                  : flash === 'down'
                  ? 'border-rose-400 ring-2 ring-rose-500/50 bg-rose-950/30'
                  : c.highlight
                  ? 'border-rose-500/50 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {flash && (
                <div
                  className={`absolute top-0 right-0 left-0 h-0.5 ${
                    flash === 'up' ? 'bg-emerald-400' : 'bg-rose-400'
                  } animate-pulse`}
                />
              )}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-medium text-slate-400">{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.tagColor}`}>
                  {c.tag}
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-base font-extrabold text-white mono-num">
                  {c.price}
                </div>
                {flash && (
                  <span
                    className={`text-[10px] font-bold px-1 py-0.2 rounded mono-num ${
                      flash === 'up'
                        ? 'text-emerald-300 bg-emerald-500/20'
                        : 'text-rose-300 bg-rose-500/20'
                    }`}
                  >
                    {flash === 'up' ? '▲' : '▼'}
                  </span>
                )}
              </div>
              <div>{renderDelta(c.change, c.changePct)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

