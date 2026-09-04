import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  QrCode, 
  Laptop, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Send, 
  CheckCircle2, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { Department, Priority, SectorCESFAM, Equipment, Ticket, TicketAIAnalysis } from '../types';
import { soundManager } from '../utils/sound';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  preSelectedEquipment?: Equipment | null;
  onTicketCreated: (newTicket: Ticket) => void;
  openQrScanner: () => void;
}

const SECTORS: SectorCESFAM[] = [
  'Farmacia y Despacho',
  'Vacunatorio y Cadena de Frío',
  'SAPU / Urgencia',
  'SOME y Admisión',
  'Laboratorio y Toma Muestras',
  'Box Dental',
  'Box Médico Sector 1',
  'Box Médico Sector 2',
  'Box Procedimientos / Curaciones',
  'Dirección y Administración',
  'Sala Racks y Telecomunicaciones',
  'Sala Eléctrica y Grupos',
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  equipments,
  preSelectedEquipment,
  onTicketCreated,
  openQrScanner,
}) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [sector, setSector] = useState<SectorCESFAM>('Farmacia y Despacho');
  const [equipmentName, setEquipmentName] = useState('');
  const [department, setDepartment] = useState<Department>('informatica');
  const [priority, setPriority] = useState<Priority>('media');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Tens Claudia Araya');
  const [reporterRole, setReporterRole] = useState('TENS / Paramédico');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<TicketAIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync with preSelectedEquipment if provided
  useEffect(() => {
    if (preSelectedEquipment) {
      setSelectedEquipmentId(preSelectedEquipment.id);
      setEquipmentName(preSelectedEquipment.name);
      setSector(preSelectedEquipment.sector);
      setDepartment(preSelectedEquipment.department);
      setPriority(preSelectedEquipment.criticalityBase);
    }
  }, [preSelectedEquipment, isOpen]);

  if (!isOpen) return null;

  const handleEquipmentChange = (id: string) => {
    setSelectedEquipmentId(id);
    const found = equipments.find((e) => e.id === id);
    if (found) {
      setEquipmentName(found.name);
      setSector(found.sector);
      setDepartment(found.department);
      setPriority(found.criticalityBase);
    }
  };

  const runAiClassification = async () => {
    if (!description.trim() && !title.trim()) {
      setAiError('Por favor escribe el título o una breve descripción del problema antes de analizar.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/classify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          equipmentId: selectedEquipmentId,
          equipmentName: equipmentName || 'Equipo CESFAM',
          sector,
          reporterName,
          reporterRole,
        }),
      });

      if (!res.ok) {
        throw new Error('Error de conexión con el servicio de IA');
      }

      const data = await res.json();
      const analysis: TicketAIAnalysis = {
        suggestedDepartment: data.suggestedDepartment || department,
        suggestedPriority: data.suggestedPriority || priority,
        suggestedSlaMinutes: data.suggestedSlaMinutes || 120,
        impactLevel: data.impactLevel || 'Operación Regular',
        justification: data.justification || 'Clasificado según matriz de impacto',
        contingencyTip: data.contingencyTip || 'Espere la llegada del técnico responsable.',
        analyzedAt: new Date().toISOString(),
      };

      setAiAnalysis(analysis);
      setDepartment(analysis.suggestedDepartment);
      setPriority(analysis.suggestedPriority);
    } catch (err: any) {
      console.error(err);
      setAiError('No se pudo conectar con la IA de criticidad. Se usarán valores predeterminados.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const ticketId = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: ticketId,
      createdAt: now,
      title: title.trim(),
      description: description.trim(),
      equipmentId: selectedEquipmentId || undefined,
      equipmentName: equipmentName.trim() || 'Incidencia General',
      sector,
      department,
      priority,
      status: 'pendiente',
      reportedBy: reporterName.trim() || 'Funcionario CESFAM',
      reporterRole: reporterRole.trim() || 'Personal de Salud',
      assignedTo: department === 'informatica' ? 'Ing. Informática' : 'Ing. Mantenimiento',
      slaTargetMinutes:
        aiAnalysis?.suggestedSlaMinutes ||
        (priority === 'urgente' ? 30 : priority === 'alta' ? 60 : priority === 'media' ? 240 : 720),
      aiAnalysis: aiAnalysis || undefined,
      timeline: [
        {
          timestamp: now,
          action: 'Ticket ingresado por funcionario en plataforma',
          user: `${reporterName} (${reporterRole})`,
        },
      ],
    };

    onTicketCreated(newTicket);
    soundManager.playNewTicketChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-teal-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-600 text-white rounded-xl shadow-md shadow-sky-600/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Nuevo Ticket de Soporte Interno
              </h3>
              <p className="text-xs text-slate-500">
                CESFAM Nuevo &bull; Asignación automatizada a Informática o Mantención
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: Equipment & QR */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-teal-600" />
                <span>Paso 1: Identificación del Equipo (QR)</span>
              </label>
              <button
                type="button"
                onClick={openQrScanner}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-100/80 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition flex items-center space-x-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Escanear / Seleccionar QR</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Código de Equipo / Sticker QR
                </label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => handleEquipmentChange(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Seleccionar o escribir equipo --</option>
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.id}] {eq.name} ({eq.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sector o Box del CESFAM
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as SectorCESFAM)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEquipmentId && (
              <div className="mt-2.5 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{equipmentName}</span>
                  <span className="text-slate-400 mx-1.5">&bull;</span>
                  <span className="text-slate-500">{sector}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    department === 'informatica'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {department === 'informatica' ? 'TI / Informática' : 'Mantenimiento'}
                </span>
              </div>
            )}
          </div>

          {/* Problem Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Título Breve del Problema
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Impresora no saca recetas de pacientes / Aire bota agua / Sin red"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Descripción de lo que ocurre
              </label>
              <button
                type="button"
                onClick={runAiClassification}
                disabled={isAnalyzing}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAnalyzing ? 'Analizando Impacto...' : 'Evaluar con Matriz IA'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Explica qué falló y a quién afecta en este momento (ej: 'No podemos despachar medicamentos a los pacientes crónicos en Farmacia', 'El refrigerador de vacunas tiene alarma de 9 grados', etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* AI Criticality Card */}
          {aiAnalysis && (
            <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-4 rounded-xl border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Matriz de Criticidad IA (Gemini Ops)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      aiAnalysis.suggestedPriority === 'urgente'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : aiAnalysis.suggestedPriority === 'alta'
                        ? 'bg-amber-600 text-white'
                        : 'bg-sky-600 text-white'
                    }`}
                  >
                    {aiAnalysis.suggestedPriority} (SLA: {aiAnalysis.suggestedSlaMinutes} min)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 font-semibold">
                {aiAnalysis.impactLevel}
              </p>
              <p className="text-xs text-slate-600 italic">
                "{aiAnalysis.justification}"
              </p>

              <div className="bg-white/80 p-2.5 rounded-lg border border-teal-200 text-xs text-teal-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Indicación de contingencia inmediata:</span>
                  <span>{aiAnalysis.contingencyTip}</span>
                </div>
              </div>
            </div>
          )}

          {aiError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Department & Priority Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Área Responsable
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDepartment('informatica')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    department === 'informatica'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>Informática (TI)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDepartment('mantenimiento')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    department === 'mantenimiento'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Mantención</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nivel de Prioridad
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['baja', 'media', 'alta', 'urgente'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg border text-[11px] font-bold capitalize transition ${
                      priority === p
                        ? p === 'urgente'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : p === 'alta'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : p === 'media'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nombre de quien solicita
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Cargo / Rol en CESFAM
              </label>
              <input
                type="text"
                required
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/30 transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Ticket al Ingeniero</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
