import React from 'react';
import { X, Bell, BellRing, Check, AlertTriangle, ShieldCheck, Zap, Trash2, Volume2 } from 'lucide-react';
import { QuantAlert, AlertSetting } from '../types/market';

interface AlertsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: QuantAlert[];
  onClearAlerts: () => void;
  onMarkAllRead: () => void;
  settings: AlertSetting[];
  onToggleSetting: (id: string) => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAlerts,
  onMarkAllRead,
  settings,
  onToggleSetting,
}) => {
  if (!isOpen) return null;

  const getAlertBadge = (level: QuantAlert['level']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'OPPORTUNITY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                실시간 퀀트 감시 및 바닥 시그널 알림
              </h3>
              <p className="text-xs text-slate-400">
                하락 둔화 및 찐바닥 핵심 신호 자동 푸시 감시
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

        {/* Content Tabs / Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Active Triggers Configuration */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              감시 알림 트리거 설정
            </span>
            <div className="space-y-2">
              {settings.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onToggleSetting(s.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{s.label}</span>
                    <span className="text-[11px] text-slate-400">{s.description}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-all flex items-center ${
                      s.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Logs List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                최근 발생 알림 ({alerts.length}건)
              </span>
              {alerts.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    모두 읽음
                  </button>
                  <button
                    onClick={onClearAlerts}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </button>
                </div>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/50">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-400">새로운 알림이 없습니다.</p>
                <p className="text-[11px] text-slate-600">지표 임계치 도달 시 즉시 알림이 생성됩니다.</p>
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border bg-slate-950/90 space-y-1.5 transition-all ${
                    !a.isRead ? 'border-amber-500/50 shadow-sm' : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAlertBadge(a.level)}`}>
                      {a.level}
                    </span>
                    <span className="text-[10px] text-slate-500 mono-num">{a.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{a.title}</h4>
                  <p className="text-[11px] text-slate-300">{a.message}</p>
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>지침: {a.actionPrompt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
