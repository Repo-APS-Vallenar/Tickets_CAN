import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X, CheckCircle, Search, Laptop, Wrench, AlertCircle } from 'lucide-react';
import { Equipment } from '../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  onEquipmentSelected: (equipment: Equipment) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  equipments,
  onEquipmentSelected,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'catalog'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Cámara no soportada en este navegador. Utiliza el selector de equipos.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Acceso a la cámara bloqueado o no disponible. Puedes seleccionar el equipo del catálogo.');
      setActiveMode('catalog');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  const filteredEquipments = equipments.filter(
    (e) =>
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Escanear Código QR de Equipo
              </h3>
              <p className="text-xs text-slate-500">
                Estrategia Paso 1: El QR identifica automáticamente el equipo, sector y responsable.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pt-3 flex space-x-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveMode('catalog')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeMode === 'catalog'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Selección Rápida de Equipo</span>
          </button>
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeMode === 'camera'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Cámara en Vivo</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'camera' ? (
            <div className="flex flex-col items-center">
              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2 mb-4 w-full">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              ) : null}

              <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-700">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* QR Target Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-sky-400 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-sky-400 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-sky-400 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-sky-400 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-sky-400 -mb-1 -mr-1" />
                    <div className="w-full h-0.5 bg-sky-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm shadow-sky-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Apunta la cámara al sticker QR pegado en la carcasa del PC, tablero o aire acondicionado.
              </p>

              <div className="w-full mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  O simula escanear un equipo frecuente de prueba:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const eq = equipments.find((e) => e.id === 'EQ-FAR-PC01');
                      if (eq) onEquipmentSelected(eq);
                    }}
                    className="p-2.5 text-left border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 transition text-xs"
                  >
                    <span className="font-bold text-slate-800 block">EQ-FAR-PC01</span>
                    <span className="text-slate-500 block">PC Rayen Farmacia (TI)</span>
                  </button>
                  <button
                    onClick={() => {
                      const eq = equipments.find((e) => e.id === 'EQ-VAC-REF01');
                      if (eq) onEquipmentSelected(eq);
                    }}
                    className="p-2.5 text-left border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 transition text-xs"
                  >
                    <span className="font-bold text-slate-800 block">EQ-VAC-REF01</span>
                    <span className="text-slate-500 block">Refrigerador Vacunas (Mant.)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Search input */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por código (ej: EQ-FAR), sector o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm"
                />
              </div>

              {/* Equipments list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredEquipments.map((eq) => {
                  const isIT = eq.department === 'informatica';
                  return (
                    <div
                      key={eq.id}
                      onClick={() => onEquipmentSelected(eq)}
                      className="p-3 border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/40 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isIT ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isIT ? <Laptop className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {eq.id}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-sm ${
                                isIT
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isIT ? 'Informática' : 'Mantenimiento'}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 line-clamp-1">
                            {eq.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {eq.sector} &bull; {eq.brandModel}
                          </p>
                        </div>
                      </div>

                      <button className="text-xs font-semibold text-sky-600 bg-sky-50 group-hover:bg-sky-600 group-hover:text-white px-2.5 py-1.5 rounded-lg transition shrink-0 ml-2">
                        Seleccionar
                      </button>
                    </div>
                  );
                })}

                {filteredEquipments.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No se encontraron equipos con esa búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>Cada equipo del CESFAM tiene un código único estandarizado.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
