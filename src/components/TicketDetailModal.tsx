import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Camera, 
  Upload, 
  User, 
  Building2, 
  Calendar, 
  AlertOctagon,
  FileText,
  ShieldCheck,
  Activity,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ticket, TicketStatus } from '../types';
import { soundManager } from '../utils/sound';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus, note?: string) => void;
  onResolveWithEvidence: (
    ticketId: string,
    notes: string,
    evidencePhotoUrl: string,
    partsUsed?: string,
    downtimeMinutesPrevented?: number
  ) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onResolveWithEvidence,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [downtimePrevented, setDowntimePrevented] = useState<number>(60);
  const [evidencePhoto, setEvidencePhoto] = useState<string>('');
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  const [aiDiagnostic, setAiDiagnostic] = useState<{
    diagnosticSteps: string[];
    estimatedResolutionTime: string;
    preventiveAdvice: string;
  } | null>(null);

  if (!isOpen || !ticket) return null;

  const isIT = ticket.department === 'informatica';
  const isResolved = ticket.status === 'resuelto';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleEvidence = (sampleUrl: string) => {
    setEvidencePhoto(sampleUrl);
  };

  const handleCompleteTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    onResolveWithEvidence(
      ticket.id,
      resolutionNotes.trim(),
      evidencePhoto || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      partsUsed.trim(),
      downtimePrevented
    );

    // Trigger celebration effects
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
    soundManager.playResolvedChime();
    onClose();
  };

  const requestAiDiagnostic = async () => {
    setIsDiagnosticLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTitle: ticket.title,
          description: ticket.description,
          equipmentName: ticket.equipmentName,
          sector: ticket.sector,
          department: ticket.department,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiDiagnostic(data);
      }
    } catch (err) {
      console.error('Error fetching AI diagnostic:', err);
    } finally {
      setIsDiagnosticLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isIT ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isIT ? <Laptop className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {ticket.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ticket.priority === 'urgente'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : ticket.priority === 'alta'
                      ? 'bg-amber-600 text-white'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    ticket.status === 'resuelto'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ticket.status === 'en_proceso'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ticket.status === 'resuelto'
                    ? 'Completado con Evidencia'
                    : ticket.status === 'en_proceso'
                    ? 'En Atención Activa'
                    : 'Pendiente de Atención'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {ticket.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                Sector CESFAM
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {ticket.sector}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                Equipo / Código
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {ticket.equipmentId || 'Sin código QR'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                Solicitante
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {ticket.reportedBy}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                Objetivo SLA
              </span>
              <span className="text-xs font-bold text-sky-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{ticket.slaTargetMinutes} minutos</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Descripción del Problema Reportado</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* AI Criticality & Operational Impact */}
          {ticket.aiAnalysis && (
            <div className="bg-gradient-to-r from-teal-50/70 to-sky-50/70 p-4 rounded-xl border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Análisis de Impacto en Operatividad CESFAM (IA)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                  {ticket.aiAnalysis.impactLevel}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic">
                "{ticket.aiAnalysis.justification}"
              </p>
              <div className="text-xs text-slate-800 bg-white/90 p-2.5 rounded-lg border border-teal-200">
                <span className="font-bold text-teal-800 block mb-0.5">
                  Protocolo inmediato para el funcionario:
                </span>
                <span>{ticket.aiAnalysis.contingencyTip}</span>
              </div>
            </div>
          )}

          {/* AI Diagnostic Assistant for Engineer */}
          {!isResolved && (
            <div className="border border-indigo-100 bg-indigo-50/50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900">
                    Asistente de Diagnóstico Técnico (Ingeniería)
                  </span>
                </div>
                <button
                  onClick={requestAiDiagnostic}
                  disabled={isDiagnosticLoading}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition shadow-xs flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDiagnosticLoading ? 'Consultando IA...' : 'Generar Checklist Técnico'}</span>
                </button>
              </div>

              {aiDiagnostic ? (
                <div className="space-y-2.5 mt-3 pt-3 border-t border-indigo-200/60 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Pasos sugeridos de revisión en terreno:
                  </span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                    {aiDiagnostic.diagnosticSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-2 text-indigo-900 font-medium">
                    <span>Tiempo est.: {aiDiagnostic.estimatedResolutionTime}</span>
                    <span className="italic text-slate-500">{aiDiagnostic.preventiveAdvice}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  ¿Problema complejo? Presiona el botón para recibir un checklist de verificación y diagnóstico rápido con Gemini.
                </p>
              )}
            </div>
          )}

          {/* Resolution Evidence (If already resolved) */}
          {isResolved && ticket.resolution && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Acta de Cierre con Evidencia (Estrategia Paso 5)</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Resuelto por {ticket.resolution.resolvedBy}
                </span>
              </div>

              <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-emerald-100">
                <span className="font-bold text-slate-900 block mb-1">Informe de Resolución:</span>
                <p className="text-slate-700">{ticket.resolution.notes}</p>
                {ticket.resolution.partsUsed && (
                  <p className="text-slate-500 mt-1">
                    <span className="font-semibold">Repuestos / Insumos:</span> {ticket.resolution.partsUsed}
                  </p>
                )}
                {ticket.resolution.downtimeMinutesPrevented && (
                  <p className="text-emerald-700 font-semibold mt-1">
                    Tiempo de detención evitado al CESFAM: {ticket.resolution.downtimeMinutesPrevented} minutos
                  </p>
                )}
              </div>

              {ticket.resolution.evidencePhotoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Evidencia Fotográfica del Arreglo:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-emerald-200 max-w-sm shadow-sm">
                    <img
                      src={ticket.resolution.evidencePhotoUrl}
                      alt="Evidencia de reparación"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Actions & Evidence Form (If not resolved) */}
          {!isResolved && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Gestión del Ticket
                </h4>
                {ticket.status === 'pendiente' && (
                  <button
                    onClick={() => onUpdateStatus(ticket.id, 'en_proceso', 'Ingeniero inició atención')}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    Tomar Ticket / En Proceso
                  </button>
                )}
              </div>

              {/* Form to Close Ticket with Evidence */}
              <form onSubmit={handleCompleteTicket} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-sky-600" />
                  <span>Cierre con Evidencia Fotográfica (Formalizar Resolución)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ¿Qué se realizó para solucionar el problema? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe el arreglo técnico (ej: 'Se cambió cable de parcheo UTP y se reseteó la boca del switch', 'Se reemplazó presostato de compresor dental')..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Repuestos / Insumos utilizados
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Cable Cat6, Fusible 10A, Conector..."
                      value={partsUsed}
                      onChange={(e) => setPartsUsed(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tiempo de detención ahorrado (minutos)
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={downtimePrevented}
                      onChange={(e) => setDowntimePrevented(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Photo evidence selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Foto de Evidencia (Cámara o archivo)
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-sky-500 rounded-lg text-xs font-medium text-slate-700 transition">
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>Subir foto desde dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">o</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSampleEvidence(
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
                        )
                      }
                      className="text-xs text-sky-600 hover:underline"
                    >
                      Usar foto de prueba
                    </button>
                  </div>

                  {evidencePhoto && (
                    <div className="mt-2 relative w-32 h-24 rounded-lg overflow-hidden border border-slate-300">
                      <img
                        src={evidencePhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEvidencePhoto('')}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cerrar Ticket con Evidencia</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Historial y Trazabilidad del Ticket
            </h4>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
              {ticket.timeline.map((entry, index) => (
                <div key={index} className="relative text-xs">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{entry.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{entry.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>CESFAM &bull; Trazabilidad oficial para Dirección</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
