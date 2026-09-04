export type Department = 'informatica' | 'mantenimiento';

export type Priority = 'baja' | 'media' | 'alta' | 'urgente';

export type TicketStatus = 'pendiente' | 'en_proceso' | 'espera_repuesto' | 'resuelto' | 'cancelado';

export type SectorCESFAM =
  | 'Farmacia y Despacho'
  | 'Vacunatorio y Cadena de Frío'
  | 'SAPU / Urgencia'
  | 'SOME y Admisión'
  | 'Laboratorio y Toma Muestras'
  | 'Box Dental'
  | 'Box Médico Sector 1'
  | 'Box Médico Sector 2'
  | 'Box Procedimientos / Curaciones'
  | 'Dirección y Administración'
  | 'Sala Racks y Telecomunicaciones'
  | 'Sala Eléctrica y Grupos';

export interface Equipment {
  id: string; // e.g. "EQ-FAR-PC01"
  name: string;
  department: Department;
  sector: SectorCESFAM;
  category: string;
  criticalityBase: Priority;
  serialNumber?: string;
  ipAddress?: string;
  brandModel: string;
  installDate: string;
  lastMaintenance?: string;
  status: 'operativo' | 'en_falla' | 'mantenimiento';
}

export interface TicketTimelineEntry {
  timestamp: string;
  action: string;
  user: string;
  note?: string;
}

export interface TicketResolution {
  resolvedAt: string;
  resolvedBy: string;
  notes: string;
  evidencePhotoUrl?: string;
  partsUsed?: string;
  downtimeMinutesPrevented?: number;
}

export interface TicketAIAnalysis {
  suggestedDepartment: Department;
  suggestedPriority: Priority;
  suggestedSlaMinutes: number;
  impactLevel: string;
  justification: string;
  contingencyTip: string;
  diagnosticSteps?: string[];
  analyzedAt: string;
}

export interface Ticket {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  equipmentId?: string;
  equipmentName: string;
  sector: SectorCESFAM;
  department: Department;
  priority: Priority;
  status: TicketStatus;
  reportedBy: string;
  reporterRole: string;
  assignedTo: string;
  slaTargetMinutes: number;
  aiAnalysis?: TicketAIAnalysis;
  resolution?: TicketResolution;
  timeline: TicketTimelineEntry[];
}

export interface PreventiveTask {
  id: string;
  title: string;
  department: Department;
  sector: SectorCESFAM;
  equipmentId?: string;
  equipmentName: string;
  scheduledDate: string;
  frequency: 'Diario' | 'Semanal' | 'Mensual' | 'Trimestral';
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  checklist: string[];
}

export interface UptimeDayMetric {
  date: string;
  overallUptime: number;
  itUptime: number;
  maintUptime: number;
  criticalEvents: number;
  ticketsHandled: number;
}

export interface CESFAMStats {
  overallUptime: number;
  itUptime: number;
  maintUptime: number;
  hoursProtected: number;
  activeTicketsCount: number;
  urgentTicketsCount: number;
  avgResolutionMinutes: number;
  completedMonthCount: number;
}
