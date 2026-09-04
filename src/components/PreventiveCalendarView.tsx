import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Laptop, 
  Wrench, 
  CheckSquare, 
  Square,
  AlertCircle,
  Building2
} from 'lucide-react';
import { PreventiveTask, Department, SectorCESFAM } from '../types';

interface PreventiveCalendarViewProps {
  tasks: PreventiveTask[];
  onToggleTaskCompleted: (taskId: string) => void;
  onAddTask: (newTask: PreventiveTask) => void;
}

export const PreventiveCalendarView: React.FC<PreventiveCalendarViewProps> = ({
  tasks,
  onToggleTaskCompleted,
  onAddTask,
}) => {
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>('informatica');
  const [sector, setSector] = useState<SectorCESFAM>('Farmacia y Despacho');
  const [scheduledDate, setScheduledDate] = useState('2026-09-08');
  const [frequency, setFrequency] = useState<'Semanal' | 'Mensual' | 'Trimestral'>('Mensual');
  const [checklistText, setChecklistText] = useState('Verificar encendido y conexión\nLimpieza física');

  const filteredTasks = tasks.filter((t) => {
    if (deptFilter !== 'all' && t.department !== deptFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: PreventiveTask = {
      id: `PRV-00${tasks.length + 1}`,
      title: title.trim(),
      department,
      sector,
      equipmentName: sector,
      scheduledDate,
      frequency,
      completed: false,
      checklist: checklistText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    onAddTask(newTask);
    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Agenda & Mantenimiento Preventivo Planificado
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Programa las rutinas obligatorias (control de vacunas, pruebas de generador, respaldo de switches y filtros de clima) para anticipar fallas y evitar solicitudes imprevistas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={() => setDeptFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            deptFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          onClick={() => setDeptFilter('informatica')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
            deptFilter === 'informatica'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Informática</span>
        </button>
        <button
          onClick={() => setDeptFilter('mantenimiento')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
            deptFilter === 'mantenimiento'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Mantención</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const isIT = task.department === 'informatica';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all ${
                task.completed
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 hover:border-indigo-400 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      isIT ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isIT ? <Laptop className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {task.id} &bull; {task.frequency}
                    </span>
                    <h4
                      className={`text-sm font-bold ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => onToggleTaskCompleted(task.id)}
                  className={`p-1.5 rounded-lg transition ${
                    task.completed
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-300 hover:text-indigo-600'
                  }`}
                  title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Square className="w-6 h-6" />
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center space-x-3 mb-3">
                <span>{task.sector}</span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1 text-indigo-700 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Programado: {task.scheduledDate}</span>
                </span>
              </div>

              {/* Checklist */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wide block mb-1">
                  Puntos de inspección preventiva:
                </span>
                {task.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-400 mt-0.5">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {task.completed && task.completedAt && (
                <div className="mt-3 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Completado por {task.completedBy || 'Ingeniero'} el{' '}
                    {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Programar Mantenimiento Preventivo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Añade una rutina técnica a la agenda de trabajo de los ingenieros.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Título de la Rutina Técnica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calibración sensor temperatura Vacunatorio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Área Responsable
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="informatica">Informática</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Fecha Programada
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sector CESFAM
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as SectorCESFAM)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Farmacia y Despacho">Farmacia</option>
                    <option value="Vacunatorio y Cadena de Frío">Vacunatorio</option>
                    <option value="SAPU / Urgencia">SAPU / Urgencia</option>
                    <option value="SOME y Admisión">SOME</option>
                    <option value="Box Dental">Box Dental</option>
                    <option value="Sala Eléctrica y Grupos">Sala Eléctrica</option>
                    <option value="Sala Racks y Telecomunicaciones">Sala Racks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Puntos del Checklist (uno por línea)
                </label>
                <textarea
                  rows={3}
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
