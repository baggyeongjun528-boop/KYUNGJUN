import { IntradayScaleInfo, MacroScaleInfo, MarketMetrics } from '../types/market';

export function evaluateIntradayScale(metrics: MarketMetrics): IntradayScaleInfo {
  // Step 5: 반등 지속 (주요 이평선 정배열 회복, VWAP/20일선 안착, 주도 섹터 랠리)
  if (
    metrics.nasdaq100.above20dma &&
    metrics.sp500.above20dma &&
    metrics.nasdaq100.aboveVwap &&
    metrics.vix.current < 20 &&
    metrics.nasdaq100.changePercent > 0.5
  ) {
    return {
      step: 5,
      title: '반등 지속 (Rally Continuity)',
      koreanTitle: '5단계 [반등 지속]',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      summary: '주요 이평선 정배열 회복 및 상방 안착, 장중 매수세 우위 지속.',
      actionGuide: '바닥 탈출 완료 국면. 무리한 추격 매수를 자제하고 건전한 장중 눌림목 분할 대응 권장.',
      recommendedCashPercent: 75,
      checklist: [
        { label: '주요 지수 20일선 및 VWAP 상회 안착', satisfied: true },
        { label: 'VIX 20 이하 안정 구간 진입', satisfied: true },
        { label: '주도 섹터 상승 모멘텀 유지', satisfied: true },
        { label: '장중 저점 지속 상향 (Higher Lows)', satisfied: true },
      ],
    };
  }

  // Step 4: 바닥 확인 / 찐바닥 1차 시그널 (FTD 발생, 20일선 탈환 안착)
  if (
    (metrics.ftdDetected || (metrics.nasdaq100.changePercent >= 1.5 && metrics.volumeRatioVsAverage >= 1.3)) &&
    (metrics.nasdaq100.above20dma || metrics.nasdaq100.aboveVwap)
  ) {
    return {
      step: 4,
      title: '바닥 확인 / 찐바닥 1차 시그널',
      koreanTitle: '4단계 [바닥 확인 / 찐바닥 1차 시그널]',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      summary: '거래량이 실린 FTD(팔로우스루 데이) 확정 또는 VWAP·20일선 탈환 성공.',
      actionGuide: '안전한 1차 분할 매수(포트폴리오의 10~15%) 적기. 손절선은 당일 저가로 엄격히 제한.',
      recommendedCashPercent: 80,
      checklist: [
        { label: '반등 4~7일 차 거래량 동반 +1.5% 이상 장대양봉(FTD)', satisfied: metrics.ftdDetected },
        { label: 'VWAP 상회 및 20일선 탈환 시도', satisfied: metrics.nasdaq100.aboveVwap || metrics.nasdaq100.above20dma },
        { label: 'VIX 피크아웃 하향 곡선 유지', satisfied: metrics.vix.isPeakedOut },
        { label: '14일 RSI 불리시 다이버전스 확인', satisfied: metrics.nasdaq100.macdDivergence || metrics.nasdaq100.rsi14 < 40 },
      ],
    };
  }

  // Step 3: 바닥 후보 (장중 저점 방어 성공, VIX 피크아웃, VWAP 회복 시도)
  if (
    metrics.isPriorLowDefended &&
    metrics.vix.isPeakedOut &&
    (metrics.nasdaq100.aboveVwap || metrics.nasdaq100.changePercent > -0.5)
  ) {
    return {
      step: 3,
      title: '바닥 후보 (Bottom Candidate)',
      koreanTitle: '3단계 [바닥 후보]',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary: '장중 최저점 방어 성공, VIX 급등 후 피크아웃 확인, VWAP 회복 시도 중.',
      actionGuide: '단기 최저가 형성 구간으로 판단. 성급한 뇌동 매수를 금지하고 관찰 유지 (공격적 분할 매수자만 5% 미만 타진).',
      recommendedCashPercent: 90,
      checklist: [
        { label: '장중 전저점 지지력 테스트 통과', satisfied: metrics.isPriorLowDefended },
        { label: 'VIX 당일 고점 대비 피크아웃', satisfied: metrics.vix.isPeakedOut },
        { label: 'VWAP 탈환 시도 중', satisfied: metrics.nasdaq100.aboveVwap },
        { label: '급락세 둔화 및 횡보 베이스 형성', satisfied: true },
      ],
    };
  }

  // Step 2: 하락 둔화 (매도세 진정, 지수 급락 속도 둔화, 지지선 탐색)
  if (
    (metrics.nasdaq100.changePercent > -1.8 && metrics.vix.current < 45) ||
    metrics.isSellingClimaxHammer
  ) {
    return {
      step: 2,
      title: '하락 둔화 (Deceleration)',
      koreanTitle: '2단계 [하락 둔화]',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      summary: '패닉 매도세 일시 진정, 지수 낙폭 축소 및 1차 지지선 탐색 진행.',
      actionGuide: '관망(Wait & Watch). 신규 매수는 철저히 유보하고 바닥 확인 신호(FTD) 발생 전까지 매수 준비만 진행.',
      recommendedCashPercent: 95,
      checklist: [
        { label: '선물/현물 지수 낙폭 축소', satisfied: metrics.nasdaq100.changePercent > -2.5 },
        { label: '거래량 실린 하락 꼬리 발생(해머형 가능성)', satisfied: metrics.isSellingClimaxHammer },
        { label: '지지선 탐색 중 (추가 하방 열려 있음)', satisfied: true },
        { label: '현금 비중 95% 이상 철저 방어', satisfied: true },
      ],
    };
  }

  // Step 1: 투매 진행 (지수 급락, VIX 급등, 거래량 폭증)
  return {
    step: 1,
    title: '투매 진행 (Panic Selling Climax)',
    koreanTitle: '1단계 [투매 진행]',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    summary: '패닉 셀링 진행 중. 지수 수직 급락, VIX 급등, 거래량 폭증.',
    actionGuide: '절대 매수 금지. 떨어지는 칼날 잡지 말 것. 현금 100% 방어 원칙 엄수.',
    recommendedCashPercent: 100,
    checklist: [
      { label: '지수 급락 진행 중', satisfied: true },
      { label: 'VIX 급등 및 변동성 폭발', satisfied: metrics.vix.current >= 25 },
      { label: '투매성 매도 거래량 폭증', satisfied: metrics.volumeRatioVsAverage >= 1.5 },
      { label: '장중 저점 지속 갱신', satisfied: !metrics.isPriorLowDefended },
    ],
  };
}

export function evaluateMacroScale(metrics: MarketMetrics): MacroScaleInfo {
  const dropFromHigh = metrics.nasdaq100.dropFromHighPercent ?? 0;
  const vix = metrics.vix.current;

  // 10단계: 역사적 찐바닥 [2025년 4월 7일형]
  // (VIX 60+ 수직 폭등 후 피크아웃, 지수 -20% 폭락 후 대반전, 10년에 한 번 오는 인생의 매수 기회)
  if (
    (vix >= 50 || metrics.vix.highToday >= 58) &&
    metrics.vix.isPeakedOut &&
    dropFromHigh <= -18 &&
    (metrics.isSellingClimaxHammer || metrics.ftdDetected || metrics.nasdaq100.changePercent > 1.0)
  ) {
    return {
      step: 10,
      title: '역사적 찐바닥 [2025년 4월 7일형 / 10년 주기 기회]',
      koreanTitle: '10단계: 역사적 찐바닥 [2025년 4월 7일형]',
      badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-400',
      summary: 'VIX 60+ 수직 폭등 후 피크아웃, 고점 대비 -20% 전후 폭락 후 대반전 캔들 형성.',
      actionGuide: '10년에 한 번 오는 인생의 매수 기회. 1차 분할 매수(20~30%) 과감히 집행. 현금 70~80% 유지하며 추가 분할 대기.',
      bottomProbability: 95,
      recommendedCashPercent: 75,
      historicalReference: '2025.04.07 시스템 위기 저점 / 2020.03.23 코로나 쇼크',
      checklist: [
        { label: 'VIX 60선 육박/돌파 후 피크아웃 꺾임', satisfied: true },
        { label: '지수 고점 대비 -18% ~ -25% 극단적 언더슈팅', satisfied: dropFromHigh <= -18 },
        { label: '극단적 공포(Fear & Greed < 10) 및 항복 투매', satisfied: metrics.fearGreedIndex < 15 },
        { label: '역대급 하락 꼬리 또는 거래량 2.5배 폭증', satisfied: metrics.volumeRatioVsAverage >= 2.0 || metrics.isSellingClimaxHammer },
      ],
    };
  }

  // 9단계: 기술적 바닥 탈출 시동 (FTD 발생, VIX 급락 다이버전스, 신용스프레드 피크아웃)
  if (
    metrics.ftdDetected &&
    metrics.vix.isPeakedOut &&
    metrics.highYieldOas.isStabilizing
  ) {
    return {
      step: 9,
      title: '기술적 바닥 탈출 시동 (FTD Confirmation)',
      koreanTitle: '9단계: 기술적 바닥 탈출 시동',
      badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-400',
      summary: 'FTD 확정, VIX 급락 다이버전스, 하이일드 신용 스프레드 피크아웃 안정화.',
      actionGuide: '기술적 바닥 확인 완료. 규칙에 따른 1차 매수 적기(15~20%). 안전마진 확보.',
      bottomProbability: 85,
      recommendedCashPercent: 80,
      historicalReference: '2022.10.13 CPI 반전 / 2024.08.08 FTD 출현',
      checklist: [
        { label: '팔로우스루 데이(FTD) 확정', satisfied: metrics.ftdDetected },
        { label: 'VIX 급락 다이버전스 발생', satisfied: metrics.vix.isPeakedOut },
        { label: '신용 스프레드(HY OAS) 안정 전환', satisfied: metrics.highYieldOas.isStabilizing },
        { label: '14일 RSI 불리시 다이버전스 확인', satisfied: metrics.nasdaq100.macdDivergence },
      ],
    };
  }

  // 8단계: 항복 투매(Capitulation) (거래량 폭증 셀링 클라이맥스, VIX 40 돌파, 시장 폭 15% 이하 과매도)
  if (
    vix >= 38 ||
    (metrics.isSellingClimaxHammer && metrics.volumeRatioVsAverage >= 2.0) ||
    (metrics.percentAbove50Dma < 15 && vix >= 32)
  ) {
    return {
      step: 8,
      title: '항복 투매 (Capitulation Selling Climax)',
      koreanTitle: '8단계: 항복 투매(Capitulation)',
      badgeColor: 'bg-red-500/30 text-red-300 border-red-500',
      summary: '거래량 폭증 셀링 클라이맥스, VIX 40 근접/돌파, 50DMA 상회 종목 15% 미만 극단적 과매도.',
      actionGuide: '투매의 정점 구간. 뇌동 매도 절대 금지. 바닥 확인 신호(FTD) 대기하며 총알(현금) 장전.',
      bottomProbability: 75,
      recommendedCashPercent: 90,
      historicalReference: '2024.08.05 엔캐리 청산 / 2022.06 CPI 패닉',
      checklist: [
        { label: '거래량 2배 이상 급증 셀링 클라이맥스 해머', satisfied: metrics.isSellingClimaxHammer || metrics.volumeRatioVsAverage >= 1.8 },
        { label: 'VIX 38~40+ 돌파', satisfied: vix >= 35 },
        { label: '50일선 상회 종목 비율 15% 이하 극단 과매도', satisfied: metrics.percentAbove50Dma < 15 },
        { label: '52주 신저가 종목 수 폭증', satisfied: metrics.newLows52w > 300 },
      ],
    };
  }

  // 7단계: 시스템/매크로 패닉 충격 (200일선 붕괴, VIX 30~35, 하이일드 스프레드 급확대)
  if (
    (!metrics.nasdaq100.above200dma || dropFromHigh <= -12) &&
    vix >= 28 &&
    metrics.highYieldOas.isWidening
  ) {
    return {
      step: 7,
      title: '시스템/매크로 패닉 충격',
      koreanTitle: '7단계: 시스템/매크로 패닉 충격',
      badgeColor: 'bg-rose-600/25 text-rose-300 border-rose-500/50',
      summary: '200일선 붕괴, VIX 30선 돌파, 하이일드 신용 스프레드 급확대.',
      actionGuide: '시스템 리스크 확산 국면. 절대 신규 매수 금지. 현금 비중 90% 이상 철저 유지.',
      bottomProbability: 60,
      recommendedCashPercent: 95,
      historicalReference: '2022.05 루나 사태 및 금리인상 쇼크',
      checklist: [
        { label: '200일선 붕괴 또는 지수 -12% 이상 하락', satisfied: !metrics.nasdaq100.above200dma },
        { label: 'VIX 30선 돌파', satisfied: vix >= 28 },
        { label: '하이일드 스프레드 급확대', satisfied: metrics.highYieldOas.isWidening },
      ],
    };
  }

  // 6단계: 추세 생명선 위협 (200일선 터치, VIX 25 돌파, 신저가 속출)
  if (
    (!metrics.nasdaq100.above200dma || dropFromHigh <= -9) ||
    (vix >= 24 && metrics.percentAbove50Dma <= 25)
  ) {
    return {
      step: 6,
      title: '추세 생명선 위협',
      koreanTitle: '6단계: 추세 생명선 위협',
      badgeColor: 'bg-amber-600/25 text-amber-300 border-amber-500/50',
      summary: '200일 이동평균선 터치 및 위협, VIX 25 돌파, 52주 신저가 종목 속출.',
      actionGuide: '장기 추세 지지 여부 판가름 구간. 지지 실패 시 추가 급락 위험. 관망 유지.',
      bottomProbability: 40,
      recommendedCashPercent: 90,
      checklist: [
        { label: '200일선 근접 또는 이탈', satisfied: !metrics.nasdaq100.above200dma },
        { label: 'VIX 24~27 구간 진입', satisfied: vix >= 24 },
        { label: '신저가 종목 수 급증', satisfied: metrics.newLows52w > 150 },
      ],
    };
  }

  // 5단계: 중기 조정 / 투심 위축 (고점 대비 -7%~-10%, 120일선 근접, 50 DMA 상회 종목 30%대 위축)
  if (dropFromHigh <= -6.5 || (metrics.percentAbove50Dma <= 35 && vix >= 20)) {
    return {
      step: 5,
      title: '중기 조정 / 투심 위축',
      koreanTitle: '5단계: 중기 조정 / 투심 위축',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary: '고점 대비 -7%~-10% 중기 조정 진행, 50DMA 상회 종목 30%대 위축.',
      actionGuide: '하락 추세 지속. 어설픈 물타기 금지. 현금 비중 85% 이상 유지.',
      bottomProbability: 25,
      recommendedCashPercent: 85,
      checklist: [
        { label: '고점 대비 -7% 이상 조정', satisfied: dropFromHigh <= -6.5 },
        { label: '50일선 상회 종목 비율 35% 이하', satisfied: metrics.percentAbove50Dma <= 35 },
        { label: 'VIX 20 돌파 지속', satisfied: vix >= 20 },
      ],
    };
  }

  // 4단계: 단기 조정 진행 (50일선 이탈, VIX 20 돌파, 섹터 순환매 균열)
  if (!metrics.nasdaq100.above50dma || vix >= 19.5 || dropFromHigh <= -4.5) {
    return {
      step: 4,
      title: '단기 조정 진행',
      koreanTitle: '4단계: 단기 조정 진행',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      summary: '50일선 이탈, VIX 20선 돌파, 섹터 순환매 균열 및 주도주 흔들림.',
      actionGuide: '단기 조정 심화 가능성. 지지선 확인 전까지 신규 진입 보류.',
      bottomProbability: 15,
      recommendedCashPercent: 85,
      checklist: [
        { label: '50일선 이탈', satisfied: !metrics.nasdaq100.above50dma },
        { label: 'VIX 20 부근 상승', satisfied: vix >= 19 },
      ],
    };
  }

  // 3단계: 건전한 1차 눌림목 (고점 대비 -3%~-5%, 50일선 지지 테스트, VIX 15~18선 안정)
  if (dropFromHigh <= -2.5 || vix >= 16) {
    return {
      step: 3,
      title: '건전한 1차 눌림목',
      koreanTitle: '3단계: 건전한 1차 눌림목',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      summary: '고점 대비 -3%~-5% 수준의 건전한 눌림목, 50일선 지지 테스트, VIX 15~18선.',
      actionGuide: '기존 보유 포지션 관리. 현금 80% 이상 유지하며 50일선 지지력 확인.',
      bottomProbability: 10,
      recommendedCashPercent: 80,
      checklist: [
        { label: '고점 대비 -3%~-5% 조정', satisfied: dropFromHigh <= -2.5 },
        { label: '50일선 지지력 유지', satisfied: metrics.nasdaq100.above50dma },
        { label: 'VIX 15~18 안정권', satisfied: vix < 19 },
      ],
    };
  }

  // 2단계: 고점 횡보 / 모멘텀 둔화 (신규 매수 금지)
  if (dropFromHigh <= -1.0 || !metrics.nasdaq100.above20dma) {
    return {
      step: 2,
      title: '고점 횡보 / 모멘텀 둔화',
      koreanTitle: '2단계: 고점 횡보 / 모멘텀 둔화',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      summary: '신고점 부근 횡보, 거래량 감소 및 상승 탄력 둔화.',
      actionGuide: '신규 매수 금지. 수익 구간 종목 부분 익절 및 현금 80%+ 확보 권장.',
      bottomProbability: 5,
      recommendedCashPercent: 80,
      checklist: [
        { label: '고점 횡보 및 모멘텀 둔화', satisfied: true },
        { label: '신규 진입 자제', satisfied: true },
      ],
    };
  }

  // 1단계: 나스닥 신고점 / 극단적 탐욕 (바닥 확률 0%, 분할 익절 및 현금 80%+ 확보)
  return {
    step: 1,
    title: '나스닥 신고점 / 극단적 탐욕',
    koreanTitle: '1단계: 나스닥 신고점 / 극단적 탐욕',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    summary: '신고가 랠리 지속, 과열 및 극단적 탐욕 구간. 바닥 형성 가능성 0%.',
    actionGuide: '바닥 확률 0%. 추격 매수 절대 금지. 분할 익절을 통해 기본 현금 80% 이상 반드시 확보.',
    bottomProbability: 0,
    recommendedCashPercent: 85,
    checklist: [
      { label: '나스닥 신고점 랠리', satisfied: true },
      { label: 'VIX 14 이하 저변동성 과열', satisfied: vix < 15 },
      { label: '공포/탐욕 지수 극단적 탐욕 (>75)', satisfied: metrics.fearGreedIndex >= 75 },
    ],
  };
}

/**
 * Generates the strictly formatted 4-section Quant Report requested by user.
 */
export function generateQuantReportMarkdown(metrics: MarketMetrics): string {
  const intraday = evaluateIntradayScale(metrics);
  const macro = evaluateMacroScale(metrics);

  const formatNumber = (num: number, digits = 2) => num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const formatChange = (change: number, pct: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatNumber(change)} (${sign}${formatNumber(pct)}%)`;
  };

  const basisNotice = metrics.isPreviousCloseBasis ? ' [직전 마감 기준]' : '';
  const sessionText = 
    metrics.session === 'REGULAR' ? '장중' :
    metrics.session === 'PRE_MARKET' ? '개장 전' :
    metrics.session === 'POST_MARKET' ? '마감 후' : '휴장/주말';

  return `### ⏱️ 1. 시장 스냅샷
- 분석 기준 시각: [한국시간 ${metrics.timestampKst} / 미국 동부시간 ${metrics.timestampEst} 기준] (${sessionText}${basisNotice})
- 주요 지수 및 지표:
  • S&P 500: ${formatNumber(metrics.sp500.price)} ${formatChange(metrics.sp500.change, metrics.sp500.changePercent)}
  • 나스닥 100: ${formatNumber(metrics.nasdaq100.price)} ${formatChange(metrics.nasdaq100.change, metrics.nasdaq100.changePercent)}
  • SPY: $${formatNumber(metrics.spy.price)} ${formatChange(metrics.spy.change, metrics.spy.changePercent)}
  • QQQ: $${formatNumber(metrics.qqq.price)} ${formatChange(metrics.qqq.change, metrics.qqq.changePercent)}
  • CBOE VIX: ${formatNumber(metrics.vix.current)} (${metrics.vix.change >= 0 ? '+' : ''}${formatNumber(metrics.vix.change)} / ${metrics.vix.isPeakedOut ? '피크아웃 확인' : '상승 압력 지속'})
  • 10년물 국채금리: ${formatNumber(metrics.us10yYield.current, 3)}% (${metrics.us10yYield.change >= 0 ? '+' : ''}${formatNumber(metrics.us10yYield.change, 3)}%p)

### 🔍 2. 핵심 지표 점검 요약
- 지지선 수성 여부 및 저점 대비 반등 탄력:
  ${metrics.isPriorLowDefended ? '전저점 지지선 방어 성공 및 저점 대비 저가 매수 유입 중.' : '전저점 지지선 이탈 위협 및 하방 변동성 노출 상태.'} (나스닥 고점 대비 ${metrics.nasdaq100.dropFromHighPercent?.toFixed(1) ?? '0'}% 위치)
- 수급 및 변동성:
  • VIX: ${metrics.vix.current.toFixed(1)} (${metrics.vix.isPeakedOut ? '고점 통과 피크아웃' : '고점 경신 주의'}, ${metrics.vix.isContango ? '콘탱고 복귀' : '백워데이션 심리 위축'})
  • VWAP & 20DMA: ${metrics.nasdaq100.aboveVwap ? 'VWAP 상회 안착' : 'VWAP 하회 저항'}, ${metrics.nasdaq100.above20dma ? '20일선 탈환' : '20일선 하회'}
  • 거래량 & 다이버전스: 평소 대비 ${metrics.volumeRatioVsAverage.toFixed(1)}배 (${metrics.isSellingClimaxHammer ? '셀링 클라이맥스 해머 포착' : '일반 거래량'}), ${metrics.nasdaq100.macdDivergence ? 'RSI/MACD 불리시 다이버전스 포착' : '다이버전스 미발생'}
  • FTD(팔로우스루 데이): ${metrics.ftdDetected ? `FTD ${metrics.ftdDayCount}일차 확정(+${metrics.ftdGainPercent.toFixed(1)}%)` : '미발생(대기)'}
  • 시장 폭(Breadth): 50일선 상회 ${metrics.percentAbove50Dma.toFixed(1)}% (${metrics.percentAbove50Dma < 15 ? '극단적 과매도 탈출 시도' : '정상 범위'}), 신저가 ${metrics.newLows52w}개

### 🎯 3. 바닥 판정 단계
- [장중 바닥 감시]: ${intraday.koreanTitle}
  → ${intraday.summary}
- [거시 사이클 찐바닥]: ${macro.koreanTitle} (바닥 확률 ${macro.bottomProbability}%)
  → ${macro.summary}

### 🛡️ 4. 퀀트 자산 배분 & 행동 지침
- 기본 원칙: 포트폴리오 현금 비중 '80% 이상 유지' 원칙 엄수
- 현재 권장 현금 비중: [${Math.max(intraday.recommendedCashPercent, macro.recommendedCashPercent)}%]
- 퀀트 액션 오더:
  ${intraday.step <= 2 ? '⚠️ [절대 매수 금지 / 관망] 떨어지는 칼날을 잡지 말고 현금을 100% 방어하십시오.' : ''}
  ${intraday.step === 3 ? '🔍 [관망 및 후보군 압축] 단기 저점 방어 중이나 확인 신호(FTD) 전까지 뇌동 매수를 금지합니다.' : ''}
  ${intraday.step === 4 ? '🎯 [안전한 1차 분할 매수 적기] FTD 및 20일선 탈환 확인. 전체 자산의 10~15% 수준으로 1차 분할 진입 허용.' : ''}
  ${intraday.step === 5 ? '🚀 [눌림목 분할 공략] 바닥 탈출 완료. 추격 매수를 자제하고 20일선 지지 눌림목만 선별 대응.' : ''}
`;
}
