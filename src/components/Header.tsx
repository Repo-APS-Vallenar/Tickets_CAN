import React from 'react';
import { 
  Building2, 
  Laptop, 
  Wrench, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  QrCode,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { Department } from '../types';

export type UserRole = 'funcionario' | 'informatica' | 'mantenimiento' | 'direccion';
export type ActiveTab = 'tickets' | 'qr_inventory' | 'uptime_dashboard' | 'preventive_calendar';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  openNewTicketModal: () => void;
  openQrScannerModal: () => void;
  urgentCount: number;
  activeTicketsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  openNewTicketModal,
  openQrScannerModal,
  urgentCount,
  activeTicketsCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & CESFAM info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-900/40">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  CESFAM <span className="text-sky-400">Tickets & Mantención</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                  APS Operatividad
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Soporte Interno: Informática (TI & Redes) &bull; Mantenimiento (Infraestructura)
              </p>
            </div>
          </div>

          {/* Right actions: Role selector, Sound, and New Ticket */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sound Mute/Unmute */}
            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sonido activado (alertas sonoras)' : 'Sonido silenciado'}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Quick QR Scan Action */}
            <button
              id="btn-header-scan-qr"
              onClick={openQrScannerModal}
              title="Escanear QR de equipo"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <QrCode className="w-4 h-4 text-teal-400" />
              <span>Escanear QR</span>
            </button>

            {/* Role switch pill */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline-block">
                Vista:
              </span>
              <button
                id="role-btn-funcionario"
                onClick={() => setCurrentRole('funcionario')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'funcionario'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Funcionario
              </button>
              <button
                id="role-btn-informatica"
                onClick={() => setCurrentRole('informatica')}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'informatica'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ing. Informática</span>
                <span className="sm:hidden">TI</span>
              </button>
              <button
                id="role-btn-mantenimiento"
                onClick={() => setCurrentRole('mantenimiento')}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'mantenimiento'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ing. Mantención</span>
                <span className="sm:hidden">Mant.</span>
              </button>
              <button
                id="role-btn-direccion"
                onClick={() => setCurrentRole('direccion')}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'direccion'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dirección / Uptime</span>
                <span className="md:hidden">Dir</span>
              </button>
            </div>

            {/* Primary Action: New Ticket */}
            <button
              id="btn-header-new-ticket"
              onClick={openNewTicketModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Ticket</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800 pt-2 pb-2 overflow-x-auto text-xs sm:text-sm">
          <button
            id="tab-btn-tickets"
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'tickets'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tickets & Solicitudes</span>
            {activeTicketsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white">
                {activeTicketsCount}
              </span>
            )}
            {urgentCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {urgentCount} Urgentes
              </span>
            )}
          </button>

          <button
            id="tab-btn-qr-inventory"
            onClick={() => setActiveTab('qr_inventory')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'qr_inventory'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Inventario con QR (Equipos)</span>
          </button>

          <button
            id="tab-btn-uptime"
            onClick={() => setActiveTab('uptime_dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'uptime_dashboard'
                ? 'bg-slate-800 text-teal-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Dashboard de Uptime (Disponibilidad)</span>
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => setActiveTab('preventive_calendar')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'preventive_calendar'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Tareas & Mantención Preventiva</span>
          </button>
        </div>
      </div>
    </header>
  );
};
