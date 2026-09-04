import React, { useState } from 'react';
import { 
  Laptop, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Filter, 
  Camera, 
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Kanban,
  List
} from 'lucide-react';
import { Ticket, Department, Priority, TicketStatus } from '../types';
import { UserRole } from './Header';

interface TicketListProps {
  tickets: Ticket[];
  currentRole: UserRole;
  onSelectTicket: (ticket: Ticket) => void;
  onTakeTicket: (ticketId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  currentRole,
  onSelectTicket,
  onTakeTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>(
    currentRole === 'informatica'
      ? 'informatica'
      : currentRole === 'mantenimiento'
      ? 'mantenimiento'
      : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (departmentFilter !== 'all' && t.department !== departmentFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.sector.toLowerCase().includes(q) ||
        (t.equipmentId && t.equipmentId.toLowerCase().includes(q)) ||
        t.reportedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const urgentTickets = filteredTickets.filter(
    (t) => t.priority === 'urgente' && t.status !== 'resuelto'
  );

  return (
    <div className="space-y-5">
      {/* Top Urgent Alert Banner if any */}
      {urgentTickets.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base block">
                ¡ATENCIÓN! {urgentTickets.length} Incidencia{urgentTickets.length > 1 ? 's' : ''} Crítica{urgentTickets.length > 1 ? 's' : ''} en Curso
              </span>
              <p className="text-xs text-rose-100">
                Afectan áreas sensibles del CESFAM (Farmacia, Vacunatorio, Urgencia o Red Central).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPriorityFilter('urgente');
              setStatusFilter('all');
            }}
            className="px-3.5 py-1.5 bg-white text-rose-700 text-xs font-bold rounded-lg shadow-sm hover:bg-rose-50 transition shrink-0 ml-2"
          >
            Ver Urgencias
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por ID (TCK-...), título, sector, equipo o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Tablero Kanban</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 px-1 font-semibold text-[11px]">Área:</span>
            <button
              onClick={() => setDepartmentFilter('all')}
              className={`px-2 py-0.5 rounded-md font-medium transition ${
                departmentFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setDepartmentFilter('informatica')}
              className={`px-2 py-0.5 rounded-md font-medium flex items-center space-x-1 transition ${
                departmentFilter === 'informatica'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3 h-3" />
              <span>Informática</span>
            </button>
            <button
              onClick={() => setDepartmentFilter('mantenimiento')}
              className={`px-2 py-0.5 rounded-md font-medium flex items-center space-x-1 transition ${
                departmentFilter === 'mantenimiento'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Mantención</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 px-1 font-semibold text-[11px]">Estado:</span>
            {(['all', 'pendiente', 'en_proceso', 'resuelto'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded-md font-medium capitalize transition ${
                  statusFilter === s
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'en_proceso' ? 'En Proceso' : s}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 px-1 font-semibold text-[11px]">Prioridad:</span>
            {(['all', 'urgente', 'alta', 'media', 'baja'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-0.5 rounded-md font-medium capitalize transition ${
                  priorityFilter === p
                    ? p === 'urgente'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : p === 'alta'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'all' ? 'Todas' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Display: List vs Kanban */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const isIT = ticket.department === 'informatica';
            const isResolved = ticket.status === 'resuelto';

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Left: Department Icon & Main Title */}
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isIT ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isIT ? <Laptop className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {ticket.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ticket.priority === 'urgente'
                              ? 'bg-rose-600 text-white'
                              : ticket.priority === 'alta'
                              ? 'bg-amber-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {ticket.sector}
                        </span>
                        {ticket.equipmentId && (
                          <span className="text-[11px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                            {ticket.equipmentId}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status badge, SLA & Quick Action */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                          ticket.status === 'resuelto'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : ticket.status === 'en_proceso'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ticket.status === 'resuelto'
                          ? 'Completado'
                          : ticket.status === 'en_proceso'
                          ? 'En Proceso'
                          : 'Pendiente'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>SLA: {ticket.slaTargetMinutes}m</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {ticket.resolution?.evidencePhotoUrl && (
                        <div
                          title="Tiene evidencia fotográfica de cierre"
                          className="p-1 text-emerald-600 bg-emerald-50 rounded-md"
                        >
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>

                {/* AI Impact snippet if urgent or high */}
                {ticket.aiAnalysis && (ticket.priority === 'urgente' || ticket.priority === 'alta') && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-teal-800">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold">{ticket.aiAnalysis.impactLevel}:</span>
                    <span className="truncate text-slate-600">{ticket.aiAnalysis.justification}</span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                No hay tickets que coincidan con los filtros seleccionados.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Todas las áreas del CESFAM se encuentran al día.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Pendientes */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Pendientes</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {filteredTickets.filter((t) => t.status === 'pendiente').length}
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredTickets
                .filter((t) => t.status === 'pendiente')
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-sm transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {ticket.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                          ticket.priority === 'urgente'
                            ? 'bg-rose-600 text-white'
                            : ticket.priority === 'alta'
                            ? 'bg-amber-600 text-white'
                            : 'bg-sky-600 text-white'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-2">
                      {ticket.title}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{ticket.sector}</span>
                      <span className="font-medium text-slate-700">{ticket.assignedTo}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: En Proceso */}
          <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-bold text-xs text-sky-800 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span>En Proceso</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-sky-200 text-sky-800 rounded-full">
                {filteredTickets.filter((t) => t.status === 'en_proceso').length}
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredTickets
                .filter((t) => t.status === 'en_proceso')
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-white p-3.5 rounded-xl border border-sky-200 hover:border-sky-500 hover:shadow-sm transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {ticket.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                          ticket.priority === 'urgente'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-2">
                      {ticket.title}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{ticket.sector}</span>
                      <span className="font-medium text-sky-700">{ticket.assignedTo}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Resueltos con Evidencia */}
          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Resueltos (Evidencia)</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                {filteredTickets.filter((t) => t.status === 'resuelto').length}
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredTickets
                .filter((t) => t.status === 'resuelto')
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-white p-3.5 rounded-xl border border-emerald-200 hover:border-emerald-500 hover:shadow-sm transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Cerrado</span>
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-2">
                      {ticket.title}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{ticket.sector}</span>
                      {ticket.resolution?.evidencePhotoUrl && (
                        <span className="text-emerald-600 flex items-center space-x-1">
                          <Camera className="w-3 h-3" />
                          <span>Foto</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
