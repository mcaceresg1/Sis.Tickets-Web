export interface Ticket {
  Total: number;
  item: string;
  IdTickets: number;
  sCodigo: string;
  sDescripcion: string;
  Usuario: string;
  Aplicacion: string;
  Modulo: string;
  Tipo: string;
  Prioridad: string;
  Estado: string;
  Inpacto: string;
  iId_usuario: number;
  totalPaginas: number;
}

export interface TicketDetail {
  IdTickets: number;
  sCodigo: string;
  IdUsuario: number;
  dfechaTicket: string;
  IdModulo: number;
  sDescripcion: string;
  IdTipo: number;
  IdAplicacion: number;
  IdPrioridad: number;
  IdEstado: number;
  IdInpacto: number;
  sVersion: string | null;
}

export interface TicketFilter {
  Usuario?: number;
  Aplicacion?: number;
  Modulo?: number;
  Tipo?: number;
  Prioridad?: number;
  Estado?: number;
  Inpacto?: number;
  numPagina?: number;
  allReg?: number;
  iCantFilas?: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
  cantidadPorPagina: number;
}

