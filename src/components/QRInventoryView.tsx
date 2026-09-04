import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Printer, 
  Plus, 
  Search, 
  Laptop, 
  Wrench, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Building2,
  Tag,
  Copy,
  Download
} from 'lucide-react';
import { Equipment, Department, SectorCESFAM } from '../types';
import { generateQrDataUrl, buildEquipmentQrPayload } from '../utils/qr';

interface QRInventoryViewProps {
  equipments: Equipment[];
  onSelectForTicket: (equipment: Equipment) => void;
  onAddEquipment: (newEquip: Equipment) => void;
}

export const QRInventoryView: React.FC<QRInventoryViewProps> = ({
  equipments,
  onSelectForTicket,
  onAddEquipment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Equipment Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState<Department>('informatica');
  const [newSector, setNewSector] = useState<SectorCESFAM>('Box Médico Sector 1');
  const [newCategory, setNewCategory] = useState('Computador Clínico');
  const [newBrandModel, setNewBrandModel] = useState('');

  // Generate QR codes for all equipments on mount or update
  useEffect(() => {
    async function loadQrs() {
      const urls: Record<string, string> = {};
      for (const eq of equipments) {
        const payload = buildEquipmentQrPayload(eq.id);
        const dataUrl = await generateQrDataUrl(payload);
        urls[eq.id] = dataUrl;
      }
      setQrDataUrls(urls);
    }
    loadQrs();
  }, [equipments]);

  const filteredEquipments = equipments.filter((eq) => {
    if (deptFilter !== 'all' && eq.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        eq.id.toLowerCase().includes(q) ||
        eq.name.toLowerCase().includes(q) ||
        eq.sector.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.brandModel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) return;

    const created: Equipment = {
      id: newId.trim().toUpperCase(),
      name: newName.trim(),
      department: newDept,
      sector: newSector,
      category: newCategory.trim() || 'Equipo General',
      brandModel: newBrandModel.trim() || 'Estándar CESFAM',
      criticalityBase: newSector.includes('Farmacia') || newSector.includes('Vacunatorio') ? 'urgente' : 'media',
      installDate: new Date().toISOString().split('T')[0],
      status: 'operativo',
    };

    onAddEquipment(created);
    setShowNewModal(false);
    setNewId('');
    setNewName('');
    setNewBrandModel('');
  };

  return (
    <div className="space-y-6">
      {/* Header card with Step 1 explanation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Inventario de Equipos con QR (Estrategia Paso 1)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            "No dejes que escriban qué falló": Pega estos códigos QR en cada PC, impresora, tablero y climatizador. Al escanear, el funcionario reporta en 5 segundos y el ticket se enruta de inmediato a Informática o Mantención.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPrintSheet(!showPrintSheet)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-700/30 transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{showPrintSheet ? 'Ocultar Etiquetas' : 'Imprimir Etiquetas QR'}</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-600 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {/* Printable Stickers Sheet Preview */}
      {showPrintSheet && (
        <div className="bg-white p-6 rounded-2xl border-2 border-teal-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                <Printer className="w-5 h-5 text-teal-600" />
                <span>Hoja de Stickers QR para Impresión (Pegar en Hardware)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Formato estándar listo para imprimir o recortar en papel adhesivo.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Hoja Completa</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            {filteredEquipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-white p-3 rounded-lg border-2 border-slate-800 flex flex-col items-center text-center shadow-xs"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-1.5 w-full flex items-center justify-center space-x-1">
                  <Building2 className="w-3 h-3 text-sky-600" />
                  <span>CESFAM NUEVO &bull; APS</span>
                </div>
                {qrDataUrls[eq.id] ? (
                  <img
                    src={qrDataUrls[eq.id]}
                    alt={`QR ${eq.id}`}
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 bg-slate-100 animate-pulse rounded" />
                )}
                <span className="font-mono text-xs font-black text-slate-950 mt-1">
                  {eq.id}
                </span>
                <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                  {eq.name}
                </span>
                <span className="text-[9px] text-slate-500 line-clamp-1">{eq.sector}</span>
                <span
                  className={`mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    eq.department === 'informatica'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {eq.department === 'informatica' ? 'TI / Informática' : 'Mantenimiento'}
                </span>
                <span className="text-[8px] text-slate-400 mt-1">
                  Escanear para solicitar soporte
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar equipo por ID, nombre, sector o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs">
          <button
            onClick={() => setDeptFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              deptFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({equipments.length})
          </button>
          <button
            onClick={() => setDeptFilter('informatica')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition ${
              deptFilter === 'informatica'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>TI / Informática</span>
          </button>
          <button
            onClick={() => setDeptFilter('mantenimiento')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition ${
              deptFilter === 'mantenimiento'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Mantenimiento</span>
          </button>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipments.map((eq) => {
          const isIT = eq.department === 'informatica';
          const qrUrl = qrDataUrls[eq.id];

          return (
            <div
              key={eq.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  {/* Left info */}
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {eq.id}
                      </span>
                      <button
                        onClick={() => handleCopyCode(eq.id)}
                        title="Copiar código"
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {copiedId === eq.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isIT
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isIT ? 'Informática' : 'Mantenimiento'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {eq.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{eq.sector}</p>
                  </div>

                  {/* QR Thumbnail */}
                  <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-lg shadow-xs">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR ${eq.id}`}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 animate-pulse rounded" />
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Categoría:</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {eq.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Modelo:</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {eq.brandModel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold flex items-center space-x-1 ${
                    eq.criticalityBase === 'urgente'
                      ? 'text-rose-600'
                      : eq.criticalityBase === 'alta'
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="capitalize">Criticidad: {eq.criticalityBase}</span>
                </span>

                <button
                  onClick={() => onSelectForTicket(eq)}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>Crear Ticket</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Register New Equipment */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Registrar Nuevo Equipo con Código QR
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Se creará la ficha técnica y se generará automáticamente el código QR listo para imprimir.
            </p>

            <form onSubmit={handleCreateEquipment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Código Identificador Único *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: EQ-FAR-PC02 o EQ-CLI-AC09"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nombre Descriptivo del Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: PC Admisión SOME 3 / Climatizador Box 6"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Área Responsable
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="informatica">Informática (TI)</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sector del CESFAM
                  </label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value as SectorCESFAM)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Farmacia y Despacho">Farmacia</option>
                    <option value="Vacunatorio y Cadena de Frío">Vacunatorio</option>
                    <option value="SAPU / Urgencia">SAPU / Urgencia</option>
                    <option value="SOME y Admisión">SOME</option>
                    <option value="Box Dental">Box Dental</option>
                    <option value="Box Médico Sector 1">Box Médico 1</option>
                    <option value="Sala Eléctrica y Grupos">Sala Eléctrica</option>
                    <option value="Sala Racks y Telecomunicaciones">Sala Racks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Marca y Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ej: HP ProDesk 400 / Anwo 18000 BTU"
                  value={newBrandModel}
                  onChange={(e) => setNewBrandModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Crear y Generar QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
