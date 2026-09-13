import React, { useState, useMemo } from 'react';
import { LineChart, BarChart3, Activity, Layers, TrendingUp, Info } from 'lucide-react';
import { MarketMetrics, PricePoint } from '../types/market';
import { generateChartHistory } from '../data/mockMarketData';

interface IndicatorChartsProps {
  metrics: MarketMetrics;
}

export const IndicatorCharts: React.FC<IndicatorChartsProps> = ({ metrics }) => {
  const [activeMetric, setActiveMetric] = useState<'price' | 'vix' | 'breadth' | 'rsi'>('price');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const history = useMemo(() => generateChartHistory(metrics), [metrics]);

  const chartData = useMemo(() => {
    if (activeMetric === 'price') {
      const values = history.map((d) => d.price);
      const min = Math.min(...values) * 0.98;
      const max = Math.max(...values) * 1.02;
      return { values, min, max, label: 'Nasdaq 100 지수 추이 ($)', unit: 'pt' };
    } else if (activeMetric === 'vix') {
      const values = history.map((d) => d.vix ?? 20);
      const min = 10;
      const max = Math.max(50, Math.max(...values) * 1.15);
      return { values, min, max, label: 'CBOE VIX 변동성 지수', unit: '' };
    } else if (activeMetric === 'breadth') {
      const values = history.map((d) => d.breadth50 ?? 50);
      const min = 0;
      const max = 100;
      return { values, min, max, label: '50일선 상회 종목 비율 (% > 50 DMA)', unit: '%' };
    } else {
      const values = history.map((d) => d.rsi ?? 50);
      const min = 15;
      const max = 85;
      return { values, min, max, label: '14일 RSI 추이', unit: '' };
    }
  }, [history, activeMetric]);

  // Coordinate calculations
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (history.length - 1)) * graphWidth;
  const getY = (val: number) =>
    padding.top + graphHeight - ((val - chartData.min) / (chartData.max - chartData.min)) * graphHeight;

  // Path generator
  const linePoints = chartData.values.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
  const areaPoints = `${getX(0)},${padding.top + graphHeight} ${linePoints} ${getX(chartData.values.length - 1)},${padding.top + graphHeight}`;

  const currentVal = chartData.values[chartData.values.length - 1];
  const startVal = chartData.values[0];
  const isOverallUp = currentVal >= startVal;

  const hoveredPoint = hoveredIndex !== null ? history[hoveredIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-100 text-base md:text-lg flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-400" />
            <span>📊 퀀트 핵심 지표 추이 시각화 (30일 인터랙티브)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            지수, VIX 변동성, 50DMA 시장 폭, RSI 다이버전스를 실시간 시각화합니다.
          </p>
        </div>

        {/* Metric Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveMetric('price')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'price'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            지수(NQ)
          </button>
          <button
            onClick={() => setActiveMetric('vix')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'vix'
                ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VIX 공포
          </button>
          <button
            onClick={() => setActiveMetric('breadth')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'breadth'
                ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            시장 폭(&gt;50D)
          </button>
          <button
            onClick={() => setActiveMetric('rsi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'rsi'
                ? 'bg-slate-800 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            14D RSI
          </button>
        </div>
      </div>

      {/* Chart Canvas Card */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 relative select-none">
        {/* Value Callout Header */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div>
            <span className="text-xs text-slate-400 font-medium">{chartData.label}</span>
            <div className="text-lg font-black text-white mono-num">
              {hoveredIndex !== null
                ? `${chartData.values[hoveredIndex].toLocaleString()}${chartData.unit}`
                : `${currentVal.toLocaleString()}${chartData.unit}`}
              <span className="text-xs font-semibold ml-2 text-slate-400">
                {hoveredPoint ? `(${hoveredPoint.time})` : '(최신)'}
              </span>
            </div>
          </div>

          {/* Sub legend info */}
          {activeMetric === 'vix' && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="text-rose-400">● 40 투매</span>
              <span className="text-purple-400">● 60 역사적 찐바닥</span>
            </div>
          )}
          {activeMetric === 'breadth' && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="text-emerald-400">● &lt;15% 극단 과매도 탈출선</span>
            </div>
          )}
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible cursor-crosshair"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={
                    activeMetric === 'vix'
                      ? '#f43f5e'
                      : activeMetric === 'breadth'
                      ? '#3b82f6'
                      : '#10b981'
                  }
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={
                    activeMetric === 'vix'
                      ? '#f43f5e'
                      : activeMetric === 'breadth'
                      ? '#3b82f6'
                      : '#10b981'
                  }
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padding.top + graphHeight * pct;
              const val = chartData.max - pct * (chartData.max - chartData.min);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Special Threshold Overlays */}
            {activeMetric === 'vix' && (
              <>
                {/* VIX 40 line */}
                <line
                  x1={padding.left}
                  y1={getY(40)}
                  x2={width - padding.right}
                  y2={getY(40)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text x={width - padding.right - 5} y={getY(40) - 4} fill="#ef4444" fontSize="10" textAnchor="end" fontWeight="bold">
                  VIX 40 (항복 투매 임계선)
                </text>

                {/* VIX 60 line (if max >= 60) */}
                {chartData.max >= 60 && (
                  <>
                    <line
                      x1={padding.left}
                      y1={getY(60)}
                      x2={width - padding.right}
                      y2={getY(60)}
                      stroke="#c084fc"
                      strokeWidth="2"
                    />
                    <text x={width - padding.right - 5} y={getY(60) - 4} fill="#c084fc" fontSize="10" textAnchor="end" fontWeight="bold">
                      VIX 60 (역사적 찐바닥 기회)
                    </text>
                  </>
                )}
              </>
            )}

            {activeMetric === 'breadth' && (
              <>
                {/* 15% oversold line */}
                <line
                  x1={padding.left}
                  y1={getY(15)}
                  x2={width - padding.right}
                  y2={getY(15)}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text x={width - padding.right - 5} y={getY(15) - 4} fill="#10b981" fontSize="10" textAnchor="end" fontWeight="bold">
                  15% (극단적 과매도 탈출선)
                </text>
              </>
            )}

            {/* Area Fill */}
            <polygon points={areaPoints} fill="url(#chartGradient)" />

            {/* Main Trend Line */}
            <polyline
              fill="none"
              stroke={
                activeMetric === 'vix'
                  ? '#f43f5e'
                  : activeMetric === 'breadth'
                  ? '#3b82f6'
                  : '#10b981'
              }
              strokeWidth="2.5"
              points={linePoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* If Price chart: also draw DMA20 and VWAP guides */}
            {activeMetric === 'price' && (
              <>
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={history.map((d, i) => `${getX(i)},${getY(d.dma20 ?? d.price)}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.2"
                  points={history.map((d, i) => `${getX(i)},${getY(d.vwap ?? d.price)}`).join(' ')}
                />
              </>
            )}

            {/* X-axis date labels */}
            {history.map((d, i) => {
              if (i % 6 === 0 || i === history.length - 1) {
                return (
                  <text
                    key={i}
                    x={getX(i)}
                    y={height - 10}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.time}
                  </text>
                );
              }
              return null;
            })}

            {/* Hover Crosshair & interactive tracker */}
            {history.map((_, i) => (
              <rect
                key={i}
                x={getX(i) - (graphWidth / history.length) / 2}
                y={padding.top}
                width={graphWidth / history.length}
                height={graphHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            ))}

            {hoveredIndex !== null && (
              <g>
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={padding.top + graphHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(chartData.values[hoveredIndex])}
                  r="5"
                  fill="#ffffff"
                  stroke={
                    activeMetric === 'vix'
                      ? '#f43f5e'
                      : activeMetric === 'breadth'
                      ? '#3b82f6'
                      : '#10b981'
                  }
                  strokeWidth="3"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Legend footnotes */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2 px-1 border-t border-slate-900 pt-2">
          <div className="flex items-center gap-4">
            {activeMetric === 'price' ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 지수 종가
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> 20일선(20DMA)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> 당일 VWAP
                </span>
              </>
            ) : (
              <span>차트 위로 마우스를 올리거나 터치하여 특정 일자의 정밀 수치를 확인하세요.</span>
            )}
          </div>
          <span className="mono-num text-slate-500">실시간 퀀트 시각화 엔진</span>
        </div>
      </div>
    </div>
  );
};
