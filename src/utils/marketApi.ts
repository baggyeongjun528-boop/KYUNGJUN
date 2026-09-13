import { MarketMetrics } from '../types/market';

export interface LiveFetchResult {
  success: boolean;
  metrics?: Partial<MarketMetrics>;
  error?: string;
  source: 'live_api' | 'fallback';
}

interface YahooChartMeta {
  symbol: string;
  regularMarketPrice: number;
  chartPreviousClose: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

export function getUsMarketSession(date: Date = new Date()): {
  session: 'REGULAR' | 'PRE_MARKET' | 'POST_MARKET' | 'CLOSED';
  desc: string;
} {
  try {
    const estString = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const estDate = new Date(estString);
    const day = estDate.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const hour = estDate.getHours();
    const minute = estDate.getMinutes();
    const totalMinutes = hour * 60 + minute;

    // Weekend (Saturday or Sunday)
    if (day === 0 || day === 6) {
      return { session: 'CLOSED', desc: '주말 휴장 (직전 마감 기준)' };
    }

    // Weekdays
    // Pre-market: 04:00 - 09:30 EST (240 to 570 min)
    if (totalMinutes >= 240 && totalMinutes < 570) {
      return { session: 'PRE_MARKET', desc: '프리마켓' };
    }
    // Regular session: 09:30 - 16:00 EST (570 to 960 min)
    if (totalMinutes >= 570 && totalMinutes < 960) {
      return { session: 'REGULAR', desc: '정규장 실시간' };
    }
    // Post-market / After-hours: 16:00 - 20:00 EST (960 to 1200 min)
    if (totalMinutes >= 960 && totalMinutes < 1200) {
      return { session: 'POST_MARKET', desc: '애프터마켓' };
    }
    // Overnight closed
    return { session: 'CLOSED', desc: '장마감 (직전 종가)' };
  } catch {
    return { session: 'CLOSED', desc: '마감 기준' };
  }
}

export async function fetchLiveMarketData(current: MarketMetrics): Promise<MarketMetrics> {
  const symbolMap: { [key: string]: string } = {
    gspc: '^GSPC',
    ndx: '^NDX',
    spy: 'SPY',
    qqq: 'QQQ',
    es: 'ES=F',
    nq: 'NQ=F',
    vix: '^VIX',
    tnx: '^TNX',
    dxy: 'DX-Y.NYB',
  };

  const fetchSymbol = async (symbol: string): Promise<YahooChartMeta | null> => {
    try {
      const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== 'number') return null;
      return meta as YahooChartMeta;
    } catch {
      return null;
    }
  };

  try {
    const results = await Promise.allSettled([
      fetchSymbol(symbolMap.gspc),
      fetchSymbol(symbolMap.ndx),
      fetchSymbol(symbolMap.spy),
      fetchSymbol(symbolMap.qqq),
      fetchSymbol(symbolMap.es),
      fetchSymbol(symbolMap.nq),
      fetchSymbol(symbolMap.vix),
      fetchSymbol(symbolMap.tnx),
      fetchSymbol(symbolMap.dxy),
    ]);

    const getValue = (idx: number): YahooChartMeta | null => {
      const item = results[idx];
      return item.status === 'fulfilled' ? item.value : null;
    };

    const gspc = getValue(0);
    const ndx = getValue(1);
    const spy = getValue(2);
    const qqq = getValue(3);
    const es = getValue(4);
    const nq = getValue(5);
    const vix = getValue(6);
    const tnx = getValue(7);
    const dxy = getValue(8);

    const now = new Date();
    const kstStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const estTime = new Date(now.getTime() - 13 * 60 * 60 * 1000);
    const estStr = `${estTime.getFullYear()}-${(estTime.getMonth() + 1).toString().padStart(2, '0')}-${estTime.getDate().toString().padStart(2, '0')} ${estTime.getHours().toString().padStart(2, '0')}:${estTime.getMinutes().toString().padStart(2, '0')}:${estTime.getSeconds().toString().padStart(2, '0')}`;

    const marketSession = getUsMarketSession(now);

    const updated: MarketMetrics = {
      ...current,
      session: marketSession.session,
      isPreviousCloseBasis: marketSession.session === 'CLOSED',
      timestampKst: kstStr,
      timestampEst: estStr,
    };

    if (gspc?.regularMarketPrice) {
      const price = Number(gspc.regularMarketPrice.toFixed(2));
      const prev = gspc.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.sp500 = {
        ...updated.sp500,
        price,
        change,
        changePercent: changePct,
        above20dma: true,
        above50dma: true,
        above200dma: true,
        aboveVwap: change >= 0,
      };
    }

    if (ndx?.regularMarketPrice) {
      const price = Number(ndx.regularMarketPrice.toFixed(2));
      const prev = ndx.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.nasdaq100 = {
        ...updated.nasdaq100,
        price,
        change,
        changePercent: changePct,
        above20dma: true,
        above50dma: true,
        above200dma: true,
        aboveVwap: change >= 0,
      };
    }

    if (spy?.regularMarketPrice) {
      const price = Number(spy.regularMarketPrice.toFixed(2));
      const prev = spy.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.spy = {
        ...updated.spy,
        price,
        change,
        changePercent: changePct,
        aboveVwap: change >= 0,
      };
    }

    if (qqq?.regularMarketPrice) {
      const price = Number(qqq.regularMarketPrice.toFixed(2));
      const prev = qqq.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.qqq = {
        ...updated.qqq,
        price,
        change,
        changePercent: changePct,
        aboveVwap: change >= 0,
      };
    }

    if (es?.regularMarketPrice) {
      const price = Number(es.regularMarketPrice.toFixed(2));
      const prev = es.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.esFutures = {
        ...updated.esFutures,
        price,
        change,
        changePercent: changePct,
      };
    }

    if (nq?.regularMarketPrice) {
      const price = Number(nq.regularMarketPrice.toFixed(2));
      const prev = nq.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      updated.nqFutures = {
        ...updated.nqFutures,
        price,
        change,
        changePercent: changePct,
      };
    }

    if (vix?.regularMarketPrice) {
      const price = Number(vix.regularMarketPrice.toFixed(2));
      const prev = vix.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      const changePct = Number(((change / prev) * 100).toFixed(2));
      const high = vix.regularMarketDayHigh || price;
      updated.vix = {
        ...updated.vix,
        current: price,
        change,
        changePercent: changePct,
        highToday: high,
        isPeakedOut: price < high || change < 0,
      };
    }

    if (tnx?.regularMarketPrice) {
      const price = Number(tnx.regularMarketPrice.toFixed(3));
      const prev = tnx.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(3));
      updated.us10yYield = {
        current: price,
        change,
      };
    }

    if (dxy?.regularMarketPrice) {
      const price = Number(dxy.regularMarketPrice.toFixed(2));
      const prev = dxy.chartPreviousClose || price;
      const change = Number((price - prev).toFixed(2));
      updated.dollarIndexDxy = {
        current: price,
        change,
      };
    }

    return updated;
  } catch {
    return current;
  }
}
