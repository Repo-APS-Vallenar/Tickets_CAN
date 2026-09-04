import React from 'react';
import { Bell, X, Laptop, Wrench, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { Ticket } from '../types';

export interface ToastAlert {
  id: string;
  type: 'new_ticket' | 'resolved_ticket' | 'status_update';
  ticket: Ticket;
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationToastProps {
  alerts: ToastAlert[];
  onDismiss: (id: string) => void;
  onOpenTicket: (ticket: Ticket) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alerts,
  onDismiss,
  onOpenTicket,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => {
        const isUrgent = alert.ticket.priority === 'urgente';
        const isIT = alert.ticket.department === 'informatica';
        const isResolved = alert.type === 'resolved_ticket';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border transition-all transform animate-in slide-in-from-bottom-5 duration-300 ${
              isUrgent
                ? 'bg-gradient-to-r from-rose-900 to-slate-900 text-white border-rose-500/80 shadow-rose-950/40'
                : isResolved
                ? 'bg-gradient-to-r from-emerald-950 to-slate-900 text-white border-emerald-500/80 shadow-emerald-950/40'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isUrgent
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isResolved
                      ? 'bg-emerald-500 text-white'
                      : isIT
                      ? 'bg-indigo-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isUrgent ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span className="font-extrabold text-xs tracking-tight">
                      {alert.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        isUrgent
                          ? 'bg-rose-600 text-white'
                          : isResolved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {alert.ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium line-clamp-1">
                    {alert.ticket.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {alert.ticket.sector} &bull; Asignado a {alert.ticket.assignedTo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {alert.ticket.id}
              </span>
              <button
                onClick={() => {
                  onOpenTicket(alert.ticket);
                  onDismiss(alert.id);
                }}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
              >
                <span>Atender / Ver Ticket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
