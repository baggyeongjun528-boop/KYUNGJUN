import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  LineChart,
  ShieldCheck,
  Layers,
  FileText,
  AlertTriangle,
  Flame,
  Volume2,
  Sliders,
  CheckCircle2,
  X,
  Bell,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Header } from './components/Header';
import { BottomScaleGauge } from './components/BottomScaleGauge';
import { MarketSnapshotCards } from './components/MarketSnapshotCards';
import { BackstageAnalysisSection } from './components/BackstageAnalysisSection';
import { IndicatorCharts } from './components/IndicatorCharts';
import { CashAllocationCalculator } from './components/CashAllocationCalculator';
import { QuantReportModal } from './components/QuantReportModal';
import { AlertsManager } from './components/AlertsManager';
import { InteractiveSimulatorDrawer } from './components/InteractiveSimulatorDrawer';
import { LiveStreamingBar } from './components/LiveStreamingBar';
import { MarketMetrics, QuantAlert, AlertSetting, MarketScenarioPreset } from './types/market';
import { PRESET_SCENARIOS } from './data/mockMarketData';
import { evaluateIntradayScale, evaluateMacroScale } from './utils/quantEngine';
import { fetchLiveMarketData } from './utils/marketApi';

export const App: React.FC = () => {
  const [metrics, setMetrics] = useState<MarketMetrics>(PRESET_SCENARIOS[0].metrics);
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Real-time Live Streaming state
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [enableMicroTicks, setEnableMicroTicks] = useState<boolean>(true);

  // Modals & Drawers
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'charts' | 'backstage' | 'allocation'>('monitor');

  // Sound chime
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toast alert
  const [toastAlert, setToastAlert] = useState<QuantAlert | null>(null);

  // Alert Settings
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([
    { id: 'vix_peak', label: 'VIX 급등 후 피크아웃 감지', description: '변동성 완화 및 바닥 후보 신호', enabled: true },
    { id: 'ftd_signal', label: '팔로우스루 데이(FTD) 확정', description: '반등 4~7일차 +1.5% 이상 대량 거래', enabled: true },
    { id: 'rsi_divergence', label: 'RSI / MACD 불리시 다이버전스', description: '지수 저점 대비 모멘텀 반등 포착', enabled: true },
    { id: 'selling_climax', label: '셀링 클라이맥스 해머형 포착', description: '거래량 2배 급증 아래꼬리 캔들', enabled: true },
    { id: 'cash_warning', label: '현금 비중 80%+ 방어 경보', description: '투매 및 하락 압력 발생 시 알림', enabled: true },
  ]);

  // Alert Logs
  const [alerts, setAlerts] = useState<QuantAlert[]>([
    {
      id: 'a1',
      timestamp: '23:30 KST',
      level: 'INFO',
      title: '퀀트 감시 시스템 가동',
      message: '실시간 주요 지수(S&P 500, QQQ, VIX, HY OAS) 모니터링 정상 작동 중.',
      indicator: 'SYSTEM',
      actionPrompt: '포트폴리오 기본 현금 비중 80% 이상 유지 원칙 엄수',
      isRead: false,
    },
    {
      id: 'a2',
      timestamp: '23:25 KST',
      level: 'WARNING',
      title: 'VIX 20일선 지지선 탐색 진행',
      message: '단기 변동성 축소 시도 중이며 지지선 수성 여부를 교차 검증하고 있습니다.',
      indicator: 'VIX',
      actionPrompt: '추격 매수 자제, 관망 및 FTD 신호 대기',
      isRead: false,
    },
  ]);

  // Play Web Audio Chime
  const playAlertSound = (type: 'chime' | 'warning' = 'chime') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio Context not available', e);
    }
  };

  // Trigger real-time simulated alerts based on metric state
  const prevStageRef = useRef<number>(1);
  useEffect(() => {
    const currentIntraday = evaluateIntradayScale(metrics);
    if (currentIntraday.step !== prevStageRef.current) {
      const newAlert: QuantAlert = {
        id: `alert_${Date.now()}`,
        timestamp: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} KST`,
        level: currentIntraday.step >= 4 ? 'OPPORTUNITY' : currentIntraday.step <= 2 ? 'CRITICAL' : 'WARNING',
        title: `바닥 판정 단계 변경: ${currentIntraday.koreanTitle}`,
        message: currentIntraday.summary,
        indicator: 'BOTTOM_SCALE',
        actionPrompt: currentIntraday.actionGuide,
        isRead: false,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 20)]);
      setToastAlert(newAlert);
      playAlertSound(currentIntraday.step >= 4 ? 'chime' : 'warning');
      prevStageRef.current = currentIntraday.step;

      const timer = setTimeout(() => setToastAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [metrics]);

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Sync countdown whenever interval changes
  useEffect(() => {
    setSecondsRemaining(refreshIntervalSec);
  }, [refreshIntervalSec]);

  // Initial fetch on mount or preset switch
  useEffect(() => {
    let isMounted = true;
    if (activePresetId === 'live_current') {
      setIsRefreshing(true);
      fetchLiveMarketData(metricsRef.current)
        .then((updated) => {
          if (isMounted) setMetrics(updated);
        })
        .finally(() => {
          if (isMounted) setIsRefreshing(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activePresetId]);

  // Real-time automatic polling timer
  useEffect(() => {
    if (!isAutoRefresh || activePresetId !== 'live_current') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger live API background sync
          fetchLiveMarketData(metricsRef.current)
            .then((fresh) => {
              setMetrics(fresh);
            })
            .catch((e) => {
              console.warn('Realtime polling sync err', e);
            });
          return refreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, refreshIntervalSec, activePresetId]);

  // Micro-ticks for realistic high-frequency orderbook action
  useEffect(() => {
    if (!enableMicroTicks || activePresetId !== 'live_current') return;

    const tickInterval = setInterval(() => {
      setMetrics((prev) => {
        const randSp = (Math.random() - 0.49) * 0.35;
        const randNdx = (Math.random() - 0.49) * 1.4;
        const randSpy = (Math.random() - 0.49) * 0.035;
        const randQqq = (Math.random() - 0.49) * 0.045;
        const randVix = (Math.random() - 0.5) * 0.015;

        const newSp500Price = Number((prev.sp500.price + randSp).toFixed(2));
        const newNdxPrice = Number((prev.nasdaq100.price + randNdx).toFixed(2));
        const newSpyPrice = Number((prev.spy.price + randSpy).toFixed(2));
        const newQqqPrice = Number((prev.qqq.price + randQqq).toFixed(2));
        const newVixPrice = Number(Math.max(10, prev.vix.current + randVix).toFixed(2));

        const now = new Date();
        const kstStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        return {
          ...prev,
          timestampKst: kstStr,
          sp500: {
            ...prev.sp500,
            price: newSp500Price,
          },
          nasdaq100: {
            ...prev.nasdaq100,
            price: newNdxPrice,
          },
          spy: {
            ...prev.spy,
            price: newSpyPrice,
          },
          qqq: {
            ...prev.qqq,
            price: newQqqPrice,
          },
          vix: {
            ...prev.vix,
            current: newVixPrice,
          },
        };
      });
    }, 2800);

    return () => clearInterval(tickInterval);
  }, [enableMicroTicks, activePresetId]);

  const handleSelectPreset = (preset: MarketScenarioPreset) => {
    setMetrics(preset.metrics);
    setActivePresetId(preset.id);
    setIsSimulatorOpen(false);
  };

  const handleRefresh = async () => {
    playAlertSound('chime');
    setIsRefreshing(true);
    try {
      if (activePresetId === 'live_current') {
        const fresh = await fetchLiveMarketData(metrics);
        setMetrics(fresh);
        setSecondsRemaining(refreshIntervalSec);
      } else {
        const now = new Date();
        const kstStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setMetrics((prev) => ({
          ...prev,
          timestampKst: kstStr,
        }));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        isMobileFrame ? 'p-3 sm:p-6 items-center justify-center bg-slate-900/60' : ''
      }`}
    >
      {/* Container wrapper (responsive or mobile frame) */}
      <div
        className={`w-full flex flex-col bg-slate-950 transition-all ${
          isMobileFrame
            ? 'max-w-[440px] h-[880px] rounded-[42px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative'
            : 'flex-1'
        }`}
      >
        {/* Top Header */}
        <Header
          metrics={metrics}
          onRefresh={handleRefresh}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          unreadAlertsCount={unreadAlertsCount}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Real-time Live Streaming Control Bar */}
        <LiveStreamingBar
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
          refreshIntervalSec={refreshIntervalSec}
          onChangeInterval={(sec) => setRefreshIntervalSec(sec)}
          secondsRemaining={secondsRemaining}
          isRefreshing={isRefreshing}
          onManualRefresh={handleRefresh}
          lastUpdatedTime={metrics.timestampKst}
          enableMicroTicks={enableMicroTicks}
          onToggleMicroTicks={() => setEnableMicroTicks(!enableMicroTicks)}
        />

        {/* Live Active Toast Alert Popup */}
        {toastAlert && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl flex items-center justify-between gap-3 animate-slide-down backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white block">{toastAlert.title}</span>
                <span className="text-slate-300 line-clamp-1">{toastAlert.actionPrompt}</span>
              </div>
            </div>
            <button
              onClick={() => setToastAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scenario Banner if not live */}
        {activePresetId !== 'live_current' && (
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border-b border-purple-800/40 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-black text-[10px] border border-purple-500/30">
                시나리오 리플레이 모드
              </span>
              <span className="font-semibold text-slate-200">
                {PRESET_SCENARIOS.find((p) => p.id === activePresetId)?.name}
              </span>
            </div>
            <button
              onClick={() => handleSelectPreset(PRESET_SCENARIOS[0])}
              className="text-emerald-400 font-bold hover:underline"
            >
              실시간으로 복귀
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {/* Quick Tab Bar for switching sections easily */}
          <div className="flex items-center justify-between gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl sticky top-2 z-20 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'monitor'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>바닥 감시</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'charts'
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>지표 추이</span>
            </button>

            <button
              onClick={() => setActiveTab('backstage')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'backstage'
                  ? 'bg-slate-800 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4대 검증</span>
            </button>

            <button
              onClick={() => setActiveTab('allocation')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'allocation'
                  ? 'bg-slate-800 text-purple-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>자산 배분</span>
            </button>
          </div>

          {/* Section 1 & 2: Primary Bottom Gauge & Market Snapshot */}
          {(activeTab === 'monitor' || !isMobileFrame) && (
            <div className="space-y-5">
              {/* Dual Bottom Scale Gauge */}
              <BottomScaleGauge metrics={metrics} />

              {/* ⏱️ 1. 시장 스냅샷 Cards */}
              <MarketSnapshotCards metrics={metrics} isStreaming={isAutoRefresh} />
            </div>
          )}

          {/* Section 3: Indicator Charts Visualizer */}
          {(activeTab === 'charts' || !isMobileFrame) && (
            <div className="space-y-5">
              <IndicatorCharts metrics={metrics} />
            </div>
          )}

          {/* Section 4: Backstage 4-Domain Analysis */}
          {(activeTab === 'backstage' || !isMobileFrame) && (
            <div className="space-y-5">
              <BackstageAnalysisSection metrics={metrics} />
            </div>
          )}

          {/* Section 5: Cash Allocation & Execution Rule */}
          {(activeTab === 'allocation' || !isMobileFrame) && (
            <div className="space-y-5">
              <CashAllocationCalculator metrics={metrics} />
            </div>
          )}
        </main>

        {/* Mobile Bottom Fixed Nav Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
              activeTab === 'monitor' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>바닥감시</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
              activeTab === 'charts' ? 'text-teal-400' : 'text-slate-400'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>지표차트</span>
          </button>
          <button
            onClick={() => setActiveTab('backstage')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
              activeTab === 'backstage' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4대검증</span>
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
              activeTab === 'allocation' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>자산배분</span>
          </button>
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-amber-400"
          >
            <FileText className="w-4 h-4" />
            <span>리포트</span>
          </button>
        </div>

        {/* Modals */}
        <QuantReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          metrics={metrics}
        />

        <InteractiveSimulatorDrawer
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          currentMetrics={metrics}
          onUpdateMetrics={(up) => setMetrics(up)}
          onSelectPreset={handleSelectPreset}
          activePresetId={activePresetId}
        />

        <AlertsManager
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
          onClearAlerts={() => setAlerts([])}
          onMarkAllRead={() =>
            setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
          }
          settings={alertSettings}
          onToggleSetting={(id) =>
            setAlertSettings((prev) =>
              prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
            )
          }
        />
      </div>
    </div>
  );
};
