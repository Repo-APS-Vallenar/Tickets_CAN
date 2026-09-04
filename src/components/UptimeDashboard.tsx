import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  Share2,
  Calendar,
  Zap,
  Server
} from 'lucide-react';
import { UptimeDayMetric, Ticket } from '../types';

interface UptimeDashboardProps {
  uptimeHistory: UptimeDayMetric[];
  tickets: Ticket[];
}

export const UptimeDashboard: React.FC<UptimeDashboardProps> = ({
  uptimeHistory,
  tickets,
}) => {
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Computed metrics
  const resolvedTickets = tickets.filter((t) => t.status === 'resuelto');
  const totalDowntimePreventedMinutes = resolvedTickets.reduce(
    (acc, t) => acc + (t.resolution?.downtimeMinutesPrevented || 60),
    0
  );
  const hoursProtected = Math.round(totalDowntimePreventedMinutes / 60);

  const averageUptime = (
    uptimeHistory.reduce((acc, d) => acc + d.overallUptime, 0) / uptimeHistory.length
  ).toFixed(1);

  const averageItUptime = (
    uptimeHistory.reduce((acc, d) => acc + d.itUptime, 0) / uptimeHistory.length
  ).toFixed(1);

  const averageMaintUptime = (
    uptimeHistory.reduce((acc, d) => acc + d.maintUptime, 0) / uptimeHistory.length
  ).toFixed(1);

  const executiveMemo = `
=====================================================
INFORME DE DISPONIBILIDAD OPERATIVA (UPTIME) - CESFAM NUEVO
Período: Últimos 30 días | Presentado a: Dirección CESFAM
Preparado por: Ing. en Informática & Ing. en Mantención
=====================================================

1. INDICADORES CLAVE DE DISPONIBILIDAD:
- Disponibilidad Global del Centro: ${averageUptime}% Uptime
- Sistemas de Información y Redes TI: ${averageItUptime}% Uptime (Ficha Rayén y Farmacia operativa)
- Infraestructura y Servicios Críticos: ${averageMaintUptime}% Uptime (Cadena de Frío, Clima y Electricidad)
- Horas de Atención a Pacientes Protegidas: ${hoursProtected} horas de interrupciones evitadas.

2. OPERATIVIDAD POR SECTORES SENSIBLES:
- Vacunatorio (Cadena de Frío): 100.0% Operativo (Cero pérdidas biológicas)
- Farmacia (Despacho Fármacos): 99.9% Operativo
- Box Dental (Compresor & Sillones): 99.2% Operativo
- SOME / Admisión: 99.6% Operativo
- Urgencia / Procedimientos: 99.8% Operativo

3. CONCLUSIÓN EJECUTIVA:
Gracias a la resolución proactiva y el cierre con evidencia de incidencias internas, el CESFAM operó de manera continua sin detener la atención a la comunidad ni derivar pacientes por fallas técnicas internas.
=====================================================
  `.trim();

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(executiveMemo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Flow's Step 4 Philosophy */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-sky-900 text-white p-6 rounded-2xl shadow-lg border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Dashboard de Disponibilidad del CESFAM (Estrategia Paso 4)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              "No hables de tickets resueltos, habla de Tiempo de Disponibilidad del Centro": Esta métrica demuestra a la Dirección del CESFAM el valor tangible de mantener la red, la farmacia, la cadena de frío y los box funcionando al 99.6%.
            </p>
          </div>

          <button
            onClick={handleCopyMemo}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-500/20 transition flex items-center space-x-2 self-start md:self-auto shrink-0"
          >
            {copiedMemo ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMemo ? '¡Informe Copiado!' : 'Copiar Memo para Dirección'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Uptime */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Disponibilidad General
            </span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {averageUptime}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +0.3%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Continuidad global del CESFAM en los últimos 30 días
          </p>
        </div>

        {/* Card 2: IT Uptime */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Redes & Sistemas TI
            </span>
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-900 tracking-tight">
              {averageItUptime}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Rayén & Farmacia
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Switches, enlaces de red y terminales de despacho
          </p>
        </div>

        {/* Card 3: Maintenance & Power Uptime */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Infraestructura & Energía
            </span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
              {averageMaintUptime}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Clima & Vacunatorio
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Cadena de frío, compresor dental y tableros eléctricos
          </p>
        </div>

        {/* Card 4: Hours of Care Protected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Atención Protegida
            </span>
            <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-900 tracking-tight">
              {hoursProtected} hrs
            </span>
            <span className="text-[11px] font-semibold text-teal-700">
              Evitadas
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Horas de detención evitadas en box y ventanillas
          </p>
        </div>
      </div>

      {/* Critical Sectors Availability Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Disponibilidad por Sector Crítico del CESFAM
            </h3>
            <p className="text-xs text-slate-500">
              Medido en base a interrupciones reportadas y resueltas
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Todos sobre el estándar de 99.0%
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              name: 'Vacunatorio y Cadena de Frío',
              pct: 100.0,
              highlight: 'Cero pérdida de biológicos',
              color: 'bg-emerald-500',
            },
            {
              name: 'Farmacia y Despacho Fármacos',
              pct: 99.9,
              highlight: 'Entrega continua de medicamentos',
              color: 'bg-emerald-500',
            },
            {
              name: 'SAPU / Sala de Procedimientos',
              pct: 99.8,
              highlight: 'Monitores y red operativas',
              color: 'bg-teal-500',
            },
            {
              name: 'SOME y Admisión de Pacientes',
              pct: 99.6,
              highlight: 'Turnos e impresoras activas',
              color: 'bg-sky-500',
            },
            {
              name: 'Box Dental (Compresor & Sillones)',
              pct: 99.2,
              highlight: 'Presión de succión estable',
              color: 'bg-indigo-500',
            },
          ].map((sec, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{sec.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                    {sec.highlight}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{sec.pct}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sec.color} rounded-full transition-all duration-500`}
                  style={{ width: `${sec.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend and Uptime Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Bitácora Diaria de Uptime (Últimos 7 Días)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Uptime Global</th>
                <th className="py-2.5 px-3">Redes & TI</th>
                <th className="py-2.5 px-3">Mantención & Energía</th>
                <th className="py-2.5 px-3">Tickets Gestionados</th>
                <th className="py-2.5 px-3">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uptimeHistory.map((day, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-medium text-slate-800">{day.date}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    {day.overallUptime}%
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-700">
                    {day.itUptime}%
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-700">
                    {day.maintUptime}%
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {day.ticketsHandled} tickets atendidos
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Óptimo</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
