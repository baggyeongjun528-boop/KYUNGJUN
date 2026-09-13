import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Activity,
  Gauge,
  BarChart,
  Globe2,
  Zap,
  TrendingUp,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';
import { MarketMetrics } from '../types/market';

interface BackstageAnalysisProps {
  metrics: MarketMetrics;
}

export const BackstageAnalysisSection: React.FC<BackstageAnalysisProps> = ({ metrics }) => {
  const StatusPill: React.FC<{ satisfied: boolean; positiveText: string; negativeText: string }> = ({
    satisfied,
    positiveText,
    negativeText,
  }) => (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
        satisfied
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      }`}
    >
      {satisfied ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
      <span>{satisfied ? positiveText : negativeText}</span>
    </div>
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-100 text-base md:text-lg flex items-center gap-2">
            <span>🔍 2. 퀀트 내부 정밀 분석 (Backstage Analysis 4대 영역)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            리포트 도출 전 감정을 배제하고 4개 영역의 정량 지표를 교차 검증합니다.
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold self-start sm:self-auto">
          알고리즘 교차 검증 활성
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 영역 ① 가격·수급 (Price & Volume) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart className="w-4 h-4" />
              ① 가격 및 수급 (Price & Supply)
            </span>
            <span className="text-[11px] text-slate-500 mono-num">Volume: {metrics.volumeRatioVsAverage.toFixed(1)}x</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 셀링 클라이맥스 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">셀링 클라이맥스 (해머형)</span>
                <span className="text-[11px] text-slate-400">거래량 2배 급증 & 긴 아래꼬리</span>
              </div>
              <StatusPill
                satisfied={metrics.isSellingClimaxHammer || metrics.volumeRatioVsAverage >= 2.0}
                positiveText="클라이맥스 포착"
                negativeText="미발생"
              />
            </div>

            {/* 전저점 지지력 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">전저점 지지력 테스트</span>
                <span className="text-[11px] text-slate-400">장중 저점 방어 및 반등 탄력</span>
              </div>
              <StatusPill
                satisfied={metrics.isPriorLowDefended}
                positiveText="지지선 방어 성공"
                negativeText="지지선 이탈 위협"
              />
            </div>

            {/* FTD 팔로우스루 데이 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">FTD (팔로우스루 데이)</span>
                <span className="text-[11px] text-slate-400">반등 4~7일차 거래량 실린 +1.5%+ 장대양봉</span>
              </div>
              <StatusPill
                satisfied={metrics.ftdDetected}
                positiveText={`FTD ${metrics.ftdDayCount}일차 확정`}
                negativeText="FTD 대기중"
              />
            </div>
          </div>
        </div>

        {/* 영역 ② 모멘텀·기술 지표 (Technicals) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              ② 모멘텀 & 기술 지표 (Technicals)
            </span>
            <span className="text-[11px] text-slate-500 mono-num">RSI: {metrics.nasdaq100.rsi14.toFixed(1)}</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* RSI/MACD 다이버전스 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">RSI / MACD 불리시 다이버전스</span>
                <span className="text-[11px] text-slate-400">지수 저점 갱신 vs 보조지표 저점 상승</span>
              </div>
              <StatusPill
                satisfied={metrics.nasdaq100.macdDivergence}
                positiveText="상승 다이버전스 포착"
                negativeText="다이버전스 없음"
              />
            </div>

            {/* VWAP 상회 여부 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">장중 VWAP 상회 여부</span>
                <span className="text-[11px] text-slate-400">기관 거래량 가중평균가 상방 유지</span>
              </div>
              <StatusPill
                satisfied={metrics.nasdaq100.aboveVwap}
                positiveText="VWAP 위 안착"
                negativeText="VWAP 아래 저항"
              />
            </div>

            {/* 20일선 안착 여부 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">20일 이동평균선(20 DMA) 안착</span>
                <span className="text-[11px] text-slate-400">단기 추세 전환 기준선</span>
              </div>
              <StatusPill
                satisfied={metrics.nasdaq100.above20dma}
                positiveText="20일선 탈환 성공"
                negativeText="20일선 하회"
              />
            </div>
          </div>
        </div>

        {/* 영역 ③ 시장 건전성 (Market Breadth) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              ③ 시장 건전성 (Market Breadth)
            </span>
            <span className="text-[11px] text-slate-500 mono-num">&gt;50DMA: {metrics.percentAbove50Dma.toFixed(1)}%</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 50일선/200일선 상회 종목 비율 과매도 탈출 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">50DMA 상회 비율 과매도(&lt;15%) 탈출</span>
                <span className="text-[11px] text-slate-400">현재 {metrics.percentAbove50Dma.toFixed(1)}% ({metrics.percentAbove50Dma < 15 ? '극단 과매도' : '정상'})</span>
              </div>
              <StatusPill
                satisfied={metrics.isBreadthOversoldExited || metrics.percentAbove50Dma >= 15}
                positiveText="과매도권 탈출 완료"
                negativeText="15% 미만 극단 과매도"
              />
            </div>

            {/* 52주 신저가 종목 수 추이 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">52주 신저가 종목 수 추이</span>
                <span className="text-[11px] text-slate-400">현재 {metrics.newLows52w}개 ({metrics.newLowsPeaking ? '피크아웃' : '정상/증가'})</span>
              </div>
              <StatusPill
                satisfied={metrics.newLowsPeaking || metrics.newLows52w < 150}
                positiveText="신저가 피크아웃/감소"
                negativeText="신저가 속출 중"
              />
            </div>
          </div>
        </div>

        {/* 영역 ④ 거시·변동성 (Macro & Volatility) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" />
              ④ 거시 & 변동성 (Macro & Volatility)
            </span>
            <span className="text-[11px] text-slate-500 mono-num">VIX: {metrics.vix.current.toFixed(1)}</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* VIX 피크아웃 & 콘탱고 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">VIX 피크아웃 & 콘탱고 복귀</span>
                <span className="text-[11px] text-slate-400">당일 고점 {metrics.vix.highToday.toFixed(1)} 돌파 실패 여부</span>
              </div>
              <StatusPill
                satisfied={metrics.vix.isPeakedOut}
                positiveText="VIX 피크아웃 확인"
                negativeText="VIX 상승 압력 잔존"
              />
            </div>

            {/* ICE BofA 하이일드 스프레드 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">하이일드 스프레드(HY OAS)</span>
                <span className="text-[11px] text-slate-400">현재 {metrics.highYieldOas.current} bps (신용 경색 여부)</span>
              </div>
              <StatusPill
                satisfied={metrics.highYieldOas.isStabilizing}
                positiveText="신용 스프레드 안정"
                negativeText="스프레드 급확대 중"
              />
            </div>

            {/* 풋/콜 비율 및 공포탐욕 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/60">
              <div>
                <span className="font-bold text-slate-200 block">공포/탐욕 & 풋/콜 비율</span>
                <span className="text-[11px] text-slate-400">F&G {metrics.fearGreedIndex} | P/C {metrics.putCallRatio.toFixed(2)}</span>
              </div>
              <span className="text-xs font-bold text-slate-300 mono-num">
                {metrics.fearGreedIndex < 20 ? '극단적 공포(기회)' : metrics.fearGreedIndex > 75 ? '극단적 탐욕(위험)' : '중립 영역'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
