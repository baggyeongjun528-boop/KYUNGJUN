import React, { useState } from 'react';
import { X, Copy, Check, Share2, FileText, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { MarketMetrics } from '../types/market';
import { generateQuantReportMarkdown } from '../utils/quantEngine';

interface QuantReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MarketMetrics;
}

export const QuantReportModal: React.FC<QuantReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  if (!isOpen) return null;

  const markdownText = generateQuantReportMarkdown(metrics);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quant_Bottom_Report_${metrics.timestampKst.replace(/[: ]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                필수 출력 양식: 4섹션 퀀트 시황 분석 리포트
              </h3>
              <p className="text-xs text-slate-400">
                장황한 설명 배제 • 핵심 압축 • 기본 현금 80%+ 엄수
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex mr-2 text-xs font-semibold">
              <button
                onClick={() => setViewMode('formatted')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'formatted'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                미리보기
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'raw'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                마크다운
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {viewMode === 'raw' ? (
            <textarea
              readOnly
              value={markdownText}
              className="w-full h-96 p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400/90 font-mono text-xs leading-relaxed resize-none focus:outline-none"
            />
          ) : (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Section 1 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <h4 className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
                  ⏱️ 1. 시장 스냅샷
                </h4>
                <div className="text-slate-300 space-y-1 pl-2">
                  <p className="text-slate-400">
                    • 분석 기준 시각: [한국시간 {metrics.timestampKst} / 미국 동부시간 {metrics.timestampEst} 기준] ({metrics.session === 'REGULAR' ? '장중' : '마감/휴장'} {metrics.isPreviousCloseBasis ? '직전 마감 기준' : ''})
                  </p>
                  <p>• S&P 500: <span className="font-bold text-white mono-num">{metrics.sp500.price.toLocaleString()}</span> ({metrics.sp500.change >= 0 ? '+' : ''}{metrics.sp500.change.toFixed(2)}, {metrics.sp500.changePercent >= 0 ? '+' : ''}{metrics.sp500.changePercent.toFixed(2)}%)</p>
                  <p>• 나스닥 100: <span className="font-bold text-white mono-num">{metrics.nasdaq100.price.toLocaleString()}</span> ({metrics.nasdaq100.change >= 0 ? '+' : ''}{metrics.nasdaq100.change.toFixed(2)}, {metrics.nasdaq100.changePercent >= 0 ? '+' : ''}{metrics.nasdaq100.changePercent.toFixed(2)}%)</p>
                  <p>• SPY: <span className="font-bold text-white mono-num">${metrics.spy.price.toFixed(2)}</span> / QQQ: <span className="font-bold text-white mono-num">${metrics.qqq.price.toFixed(2)}</span></p>
                  <p>• CBOE VIX: <span className="font-bold text-white mono-num">{metrics.vix.current.toFixed(2)}</span> ({metrics.vix.change >= 0 ? '+' : ''}{metrics.vix.change.toFixed(2)} / {metrics.vix.isPeakedOut ? '피크아웃 확인' : '상승 압력 지속'})</p>
                  <p>• 10년물 국채금리: <span className="font-bold text-white mono-num">{metrics.us10yYield.current.toFixed(3)}%</span> ({metrics.us10yYield.change >= 0 ? '+' : ''}{metrics.us10yYield.change.toFixed(3)}%p)</p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <h4 className="font-extrabold text-teal-400 text-sm flex items-center gap-1.5">
                  🔍 2. 핵심 지표 점검 요약
                </h4>
                <div className="text-slate-300 space-y-1.5 pl-2">
                  <p>
                    <strong className="text-slate-200">• 지지선 수성 여부 및 반등 탄력:</strong><br />
                    {metrics.isPriorLowDefended ? '전저점 지지선 방어 성공 및 저점 대비 저가 매수세 유입 중.' : '전저점 지지선 이탈 위협 및 하방 변동성 노출 상태.'} (나스닥 고점 대비 {metrics.nasdaq100.dropFromHighPercent?.toFixed(1) ?? '0'}% 위치)
                  </p>
                  <p>
                    <strong className="text-slate-200">• 수급 및 변동성:</strong><br />
                    VIX {metrics.vix.current.toFixed(1)} ({metrics.vix.isPeakedOut ? '피크아웃 확인' : '고점 경신 주의'}), {metrics.nasdaq100.aboveVwap ? 'VWAP 상회' : 'VWAP 하회'}, 20DMA {metrics.nasdaq100.above20dma ? '안착' : '하회'}, 거래량 평소 {metrics.volumeRatioVsAverage.toFixed(1)}배, {metrics.isSellingClimaxHammer ? '셀링 클라이맥스 해머 포착' : '일반 거래'}, {metrics.ftdDetected ? `FTD ${metrics.ftdDayCount}일차 확정` : 'FTD 대기'}.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <h4 className="font-extrabold text-purple-400 text-sm flex items-center gap-1.5">
                  🎯 3. 바닥 판정 단계
                </h4>
                <div className="text-slate-300 space-y-1 pl-2">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">• 장중 바닥 감시:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {metrics.isSellingClimaxHammer || metrics.ftdDetected ? '4단계 [바닥 확인 / 1차 시그널]' : metrics.isPriorLowDefended ? '3단계 [바닥 후보]' : '1단계 [투매 진행]'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">• 거시 사이클 찐바닥:</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      {(metrics.nasdaq100.dropFromHighPercent ?? 0) <= -18 ? '10단계: 역사적 찐바닥 [2025.04.07형]' : metrics.ftdDetected ? '9단계: 기술적 바닥 탈출' : '3~5단계: 조정 진행'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <h4 className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
                  🛡️ 4. 퀀트 자산 배분 & 행동 지침
                </h4>
                <div className="text-slate-200 space-y-1.5 pl-2">
                  <p className="font-bold text-amber-300">
                    • 기본 원칙: 포트폴리오 현금 비중 '80% 이상 유지' 원칙 엄수
                  </p>
                  <p>
                    • 현재 권장 현금 비중: <span className="text-base font-extrabold text-white mono-num">80% ~ 95%</span>
                  </p>
                  <p className="text-emerald-300 font-semibold">
                    • 퀀트 행동 명령: 감정을 배제하고 사전 정해진 매매 룰에 의해서만 1차 분할 매수를 집행하십시오. 뇌동 매매 및 추격 매수 절대 금지.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.md 저장</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '리포트 복사 완료!' : '4섹션 리포트 클립보드 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
