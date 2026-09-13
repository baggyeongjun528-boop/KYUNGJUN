export type MarketSession = 'PRE_MARKET' | 'REGULAR' | 'POST_MARKET' | 'CLOSED';

export interface PricePoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume: number;
  dma20?: number;
  dma50?: number;
  dma200?: number;
  vwap?: number;
  vix?: number;
  breadth50?: number; // % stocks > 50 DMA
  rsi?: number;
}

export interface MarketIndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high52w?: number;
  low52w?: number;
  dropFromHighPercent?: number;
  above20dma: boolean;
  above50dma: boolean;
  above200dma: boolean;
  aboveVwap: boolean;
  rsi14: number;
  macdDivergence: boolean;
}

export interface MarketMetrics {
  timestampKst: string;
  timestampEst: string;
  session: MarketSession;
  isPreviousCloseBasis: boolean;
  
  // Major Indices & Proxies
  sp500: MarketIndexData;
  nasdaq100: MarketIndexData;
  spy: MarketIndexData;
  qqq: MarketIndexData;
  esFutures: MarketIndexData;
  nqFutures: MarketIndexData;
  
  // Volatility & Macro
  vix: {
    current: number;
    change: number;
    changePercent: number;
    isPeakedOut: boolean;
    isContango: boolean;
    highToday: number;
  };
  us10yYield: {
    current: number;
    change: number;
  };
  dollarIndexDxy: {
    current: number;
    change: number;
  };
  highYieldOas: {
    current: number; // bps or %
    isWidening: boolean;
    isStabilizing: boolean;
  };
  putCallRatio: number;
  fearGreedIndex: number; // 0 to 100
  
  // Market Health & Breadth
  percentAbove50Dma: number; // e.g. 18%
  percentAbove200Dma: number;
  newLows52w: number;
  newLowsPeaking: boolean;
  isBreadthOversoldExited: boolean; // escaping < 15%
  
  // Price & Supply/Demand Signs
  isSellingClimaxHammer: boolean;
  volumeRatioVsAverage: number; // e.g. 2.4x
  isPriorLowDefended: boolean;
  ftdDetected: boolean;
  ftdDayCount: number; // 1-7 days
  ftdGainPercent: number;
}

export interface IntradayScaleInfo {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  koreanTitle: string;
  badgeColor: string;
  summary: string;
  actionGuide: string;
  recommendedCashPercent: number;
  checklist: {
    label: string;
    satisfied: boolean;
  }[];
}

export interface MacroScaleInfo {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  title: string;
  koreanTitle: string;
  badgeColor: string;
  summary: string;
  actionGuide: string;
  bottomProbability: number; // 0% - 100%
  recommendedCashPercent: number;
  historicalReference?: string;
  checklist: {
    label: string;
    satisfied: boolean;
  }[];
}

export interface QuantAlert {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO';
  title: string;
  message: string;
  indicator: string;
  actionPrompt: string;
  isRead: boolean;
}

export interface AlertSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  threshold?: number;
}

export interface MarketScenarioPreset {
  id: string;
  name: string;
  dateStr: string;
  badge: string;
  description: string;
  metrics: MarketMetrics;
  historicalNote: string;
}
