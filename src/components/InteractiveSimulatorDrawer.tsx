import React from 'react';
import { X, Sliders, Play, RotateCcw, Sparkles, AlertCircle, History, Check } from 'lucide-react';
import { MarketMetrics, MarketScenarioPreset } from '../types/market';
import { PRESET_SCENARIOS } from '../data/mockMarketData';

interface SimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMetrics: MarketMetrics;
  onUpdateMetrics: (updated: MarketMetrics) => void;
  onSelectPreset: (preset: MarketScenarioPreset) => void;
  activePresetId: string;
}

export const InteractiveSimulatorDrawer: React.FC<SimulatorDrawerProps> = ({
  isOpen,
  onClose,
  currentMetrics,
  onUpdateMetrics,
  onSelectPreset,
  activePresetId,
}) => {
  if (!isOpen) return null;

  const handleSliderChange = (field: keyof MarketMetrics | string, value: any) => {
    const updated = { ...currentMetrics };
    if (field === 'vix') {
      updated.vix = { ...updated.vix, current: value };
    } else if (field === 'vixPeaked') {
      updated.vix = { ...updated.vix, isPeakedOut: value };
    } else if (field === 'nasdaqDrop') {
      updated.nasdaq100 = { ...updated.nasdaq100, dropFromHighPercent: value };
    } else if (field === 'nasdaqChange') {
      updated.nasdaq100 = { ...updated.nasdaq100, changePercent: value };
    } else if (field === 'ftd') {
      updated.ftdDetected = value;
      if (value) {
        updated.ftdDayCount = 4;
        updated.ftdGainPercent = 2.1;
      }
    } else if (field === 'sellingClimax') {
      updated.isSellingClimaxHammer = value;
      if (value) updated.volumeRatioVsAverage = 2.4;
    } else if (field === 'priorLow') {
      updated.isPriorLowDefended = value;
    } else if (field === 'above20dma') {
      updated.nasdaq100 = { ...updated.nasdaq100, above20dma: value };
    } else if (field === 'aboveVwap') {
      updated.nasdaq100 = { ...updated.nasdaq100, aboveVwap: value };
    } else if (field === 'breadth50') {
      updated.percentAbove50Dma = value;
    }
    onUpdateMetrics(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                시나리오 리플레이 & 퀀트 인터랙티브 튜너
              </h3>
              <p className="text-xs text-slate-400">
                역사적 찐바닥 국면 테스트 및 지표 실시간 시뮬레이션
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5">
          {/* Preset Scenarios List */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1. 역사적/실시간 바닥 시나리오 프리셋 선택
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p) => {
                const isSelected = p.id === activePresetId;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPreset(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/70 border-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-emerald-400">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Dynamic Sliders & Toggles */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              2. 퀀트 변수 실시간 동적 튜닝 (즉시 단계 재판정)
            </span>

            {/* VIX Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">CBOE VIX 변동성 지수:</span>
                <span className="text-rose-400 mono-num font-bold">
                  {currentMetrics.vix.current.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="75"
                step="0.5"
                value={currentMetrics.vix.current}
                onChange={(e) => handleSliderChange('vix', Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15 (안정)</span>
                <span>30 (패닉)</span>
                <span>40 (투매)</span>
                <span>60+ (역사적 바닥)</span>
              </div>
            </div>

            {/* Nasdaq Drop from High */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">나스닥 고점 대비 하락률 (%):</span>
                <span className="text-purple-400 mono-num font-bold">
                  {currentMetrics.nasdaq100.dropFromHighPercent?.toFixed(1) ?? '0'}%
                </span>
              </div>
              <input
                type="range"
                min="-35"
                max="0"
                step="0.5"
                value={currentMetrics.nasdaq100.dropFromHighPercent ?? 0}
                onChange={(e) => handleSliderChange('nasdaqDrop', Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Market Breadth > 50 DMA */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">50일선 상회 종목 비율 (%):</span>
                <span className="text-blue-400 mono-num font-bold">
                  {currentMetrics.percentAbove50Dma.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="1"
                value={currentMetrics.percentAbove50Dma}
                onChange={(e) => handleSliderChange('breadth50', Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Boolean Toggles Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
              {/* VIX Peakout */}
              <button
                onClick={() => handleSliderChange('vixPeaked', !currentMetrics.vix.isPeakedOut)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.vix.isPeakedOut
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>VIX 피크아웃</span>
                {currentMetrics.vix.isPeakedOut && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* FTD Trigger */}
              <button
                onClick={() => handleSliderChange('ftd', !currentMetrics.ftdDetected)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.ftdDetected
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>FTD 확정 (+1.5% 거래량)</span>
                {currentMetrics.ftdDetected && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Selling Climax Hammer */}
              <button
                onClick={() => handleSliderChange('sellingClimax', !currentMetrics.isSellingClimaxHammer)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.isSellingClimaxHammer
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>해머형 클라이맥스(2x 볼륨)</span>
                {currentMetrics.isSellingClimaxHammer && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Prior Low Defended */}
              <button
                onClick={() => handleSliderChange('priorLow', !currentMetrics.isPriorLowDefended)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.isPriorLowDefended
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>전저점 지지력 수성</span>
                {currentMetrics.isPriorLowDefended && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* 20 DMA Reclaimed */}
              <button
                onClick={() => handleSliderChange('above20dma', !currentMetrics.nasdaq100.above20dma)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.nasdaq100.above20dma
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>20일선(20 DMA) 탈환</span>
                {currentMetrics.nasdaq100.above20dma && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* VWAP Reclaimed */}
              <button
                onClick={() => handleSliderChange('aboveVwap', !currentMetrics.nasdaq100.aboveVwap)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  currentMetrics.nasdaq100.aboveVwap
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>VWAP 상회 안착</span>
                {currentMetrics.nasdaq100.aboveVwap && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            진단 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
