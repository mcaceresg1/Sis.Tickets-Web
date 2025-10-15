export interface Ticket {
  idTicket: number;
  numeroTicket: string;
  asunto: string;
  descripcion: string;
  idAplicacion: number;
  nombreAplicacion: string;
  idModulo: number;
  nombreModulo: string;
  idEmpresa: number;
  nombreEmpresa: string;
  idEstado: number;
  nombreEstado: string;
  idPrioridad: number;
  nombrePrioridad: string;
  idImpacto: number;
  nombreImpacto: string;
  idUsuarioCreador: number;
  nombreUsuarioCreador: string;
  idUsuarioAsignado?: number;
  nombreUsuarioAsignado?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  fechaCierre?: Date;
  adjuntos?: string;
  comentarios?: string;
}

export interface TicketFilter {
  idEmpresa?: number;
  idEstado?: number;
  idUsuarioCreador?: number;
}

