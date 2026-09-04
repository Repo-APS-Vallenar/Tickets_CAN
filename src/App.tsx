import React, { useState, useEffect } from 'react';
import { 
  Header, 
  UserRole, 
  ActiveTab 
} from './components/Header';
import { TicketList } from './components/TicketList';
import { NewTicketModal } from './components/NewTicketModal';
import { QrScannerModal } from './components/QrScannerModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { QRInventoryView } from './components/QRInventoryView';
import { UptimeDashboard } from './components/UptimeDashboard';
import { PreventiveCalendarView } from './components/PreventiveCalendarView';
import { NotificationToast, ToastAlert } from './components/NotificationToast';

import { 
  Ticket, 
  Equipment, 
  PreventiveTask, 
  UptimeDayMetric, 
  TicketStatus 
} from './types';

import { 
  INITIAL_EQUIPMENTS, 
  INITIAL_TICKETS, 
  INITIAL_PREVENTIVE_TASKS, 
  INITIAL_UPTIME_HISTORY 
} from './data/initialData';

import { soundManager } from './utils/sound';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('informatica');
  const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Core Data
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('cesfam_tickets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TICKETS;
  });

  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('cesfam_equipments_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EQUIPMENTS;
  });

  const [preventiveTasks, setPreventiveTasks] = useState<PreventiveTask[]>(() => {
    const saved = localStorage.getItem('cesfam_tasks_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PREVENTIVE_TASKS;
  });

  const [uptimeHistory] = useState<UptimeDayMetric[]>(INITIAL_UPTIME_HISTORY);

  // Modals & UI States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [preSelectedEquipment, setPreSelectedEquipment] = useState<Equipment | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ToastAlert[]>([]);

  // Sync sound manager with state
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Persist tickets
  useEffect(() => {
    localStorage.setItem('cesfam_tickets_v1', JSON.stringify(tickets));
  }, [tickets]);

  // Persist equipments
  useEffect(() => {
    localStorage.setItem('cesfam_equipments_v1', JSON.stringify(equipments));
  }, [equipments]);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem('cesfam_tasks_v1', JSON.stringify(preventiveTasks));
  }, [preventiveTasks]);

  // Handler: Create new ticket
  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);

    // Dispatch real-time notification alert
    const newAlert: ToastAlert = {
      id: `alert-${Date.now()}`,
      type: 'new_ticket',
      ticket: newTicket,
      title: '¡Te acaba de llegar un ticket!',
      message: `${newTicket.sector}: ${newTicket.title}`,
      timestamp: new Date().toISOString(),
    };
    setActiveAlerts((prev) => [newAlert, ...prev]);

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 7000);
  };

  // Handler: Update status
  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus, note?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedTimeline = [
            ...t.timeline,
            {
              timestamp: new Date().toISOString(),
              action: `Estado cambiado a: ${newStatus}`,
              user: currentRole === 'informatica' ? 'Ing. Informática' : 'Ing. Mantenimiento',
              note,
            },
          ];
          const updated = {
            ...t,
            status: newStatus,
            timeline: updatedTimeline,
          };
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Handler: Formal resolution with evidence photo
  const handleResolveWithEvidence = (
    ticketId: string,
    notes: string,
    evidencePhotoUrl: string,
    partsUsed?: string,
    downtimeMinutesPrevented?: number
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const resolvedBy =
            currentRole === 'informatica'
              ? 'Ing. en Informática'
              : 'Ing. en Mantenimiento';

          const updatedTimeline = [
            ...t.timeline,
            {
              timestamp: new Date().toISOString(),
              action: 'Ticket completado y formalizado con evidencia fotográfica',
              user: resolvedBy,
              note: notes,
            },
          ];

          const updated: Ticket = {
            ...t,
            status: 'resuelto',
            resolution: {
              resolvedAt: new Date().toISOString(),
              resolvedBy,
              notes,
              evidencePhotoUrl,
              partsUsed,
              downtimeMinutesPrevented: downtimeMinutesPrevented || 60,
            },
            timeline: updatedTimeline,
          };

          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updated);
          }

          // Send notification to staff member
          const resolveAlert: ToastAlert = {
            id: `alert-res-${Date.now()}`,
            type: 'resolved_ticket',
            ticket: updated,
            title: '¡Ticket Resuelto con Evidencia!',
            message: `Atendido por ${resolvedBy}. Se adjuntó acta fotográfica de cierre.`,
            timestamp: new Date().toISOString(),
          };
          setActiveAlerts((al) => [resolveAlert, ...al]);
          setTimeout(() => {
            setActiveAlerts((al) => al.filter((a) => a.id !== resolveAlert.id));
          }, 7000);

          return updated;
        }
        return t;
      })
    );
  };

  // Select equipment from QR scanner
  const handleEquipmentSelectedFromQR = (equipment: Equipment) => {
    setPreSelectedEquipment(equipment);
    setIsQrScannerOpen(false);
    setIsNewTicketOpen(true);
  };

  const handleSelectForTicket = (equipment: Equipment) => {
    setPreSelectedEquipment(equipment);
    setIsNewTicketOpen(true);
  };

  const handleAddEquipment = (newEquip: Equipment) => {
    setEquipments((prev) => [newEquip, ...prev]);
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    setPreventiveTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString() : undefined,
            completedBy: newCompleted
              ? currentRole === 'informatica'
                ? 'Ing. Informática'
                : 'Ing. Mantenimiento'
              : undefined,
          };
        }
        return task;
      })
    );
  };

  const handleAddTask = (newTask: PreventiveTask) => {
    setPreventiveTasks((prev) => [newTask, ...prev]);
  };

  // Metrics
  const activeTicketsCount = tickets.filter((t) => t.status !== 'resuelto').length;
  const urgentCount = tickets.filter(
    (t) => t.priority === 'urgente' && t.status !== 'resuelto'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Primary Header & Navigation */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        openNewTicketModal={() => {
          setPreSelectedEquipment(null);
          setIsNewTicketOpen(true);
        }}
        openQrScannerModal={() => setIsQrScannerOpen(true)}
        urgentCount={urgentCount}
        activeTicketsCount={activeTicketsCount}
      />

      {/* Role banner context */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4 sm:px-8 text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {currentRole === 'informatica' &&
              'Sesión Activa: Ingeniero en Informática (Sistemas Rayén, Redes, Switches, PCs, Impresoras)'}
            {currentRole === 'mantenimiento' &&
              'Sesión Activa: Ingeniero en Mantenimiento (Electricidad, Climatización, Cadena de Frío, Compresores)'}
            {currentRole === 'funcionario' &&
              'Portal del Funcionario: Reporte ágil de incidencias internas por escaneo QR o solicitud web'}
            {currentRole === 'direccion' &&
              'Vista Dirección CESFAM: Dashboard de Uptime, impacto en operatividad y reportes ejecutivos'}
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] text-slate-500">
          CESFAM APS &bull; Soporte Interno
        </span>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tickets' && (
          <TicketList
            tickets={tickets}
            currentRole={currentRole}
            onSelectTicket={(t) => setSelectedTicket(t)}
            onTakeTicket={(id) => handleUpdateStatus(id, 'en_proceso', 'Ingeniero tomó el ticket')}
          />
        )}

        {activeTab === 'qr_inventory' && (
          <QRInventoryView
            equipments={equipments}
            onSelectForTicket={handleSelectForTicket}
            onAddEquipment={handleAddEquipment}
          />
        )}

        {activeTab === 'uptime_dashboard' && (
          <UptimeDashboard
            uptimeHistory={uptimeHistory}
            tickets={tickets}
          />
        )}

        {activeTab === 'preventive_calendar' && (
          <PreventiveCalendarView
            tasks={preventiveTasks}
            onToggleTaskCompleted={handleToggleTaskCompleted}
            onAddTask={handleAddTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          Sistema de Tickets y Disponibilidad CESFAM &bull; Implementando la Estrategia de 5 Pasos: Inventariado QR, Matriz de Criticidad IA, Web Progresiva, Dashboard Uptime y Cierre con Evidencia.
        </p>
      </footer>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        equipments={equipments}
        preSelectedEquipment={preSelectedEquipment}
        onTicketCreated={handleTicketCreated}
        openQrScanner={() => {
          setIsNewTicketOpen(false);
          setIsQrScannerOpen(true);
        }}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        equipments={equipments}
        onEquipmentSelected={handleEquipmentSelectedFromQR}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onUpdateStatus={handleUpdateStatus}
        onResolveWithEvidence={handleResolveWithEvidence}
      />

      {/* Floating Notifications Toast Banner */}
      <NotificationToast
        alerts={activeAlerts}
        onDismiss={(id) => setActiveAlerts((prev) => prev.filter((a) => a.id !== id))}
        onOpenTicket={(t) => setSelectedTicket(t)}
      />
    </div>
  );
}
