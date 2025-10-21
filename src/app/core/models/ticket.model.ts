export interface Ticket {
  Total: number;
  item: string;
  IdTickets: number;
  sCodigo: string;
  sDescripcion: string;
  Usuario: string;
  Sistema: string;     // ✅ NUEVO: Sistema (nivel 1)
  Modulo: string;      // Módulo (nivel 2)
  Pagina: string;      // Página (nivel 3)
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
  IdSistema?: number;       // ✅ NUEVO: ID del Sistema
  Sistema?: string;         // ✅ NUEVO: Nombre del Sistema
  IdModulo: number;         // ID del Módulo
  Modulo?: string;          // ✅ NUEVO: Nombre del Módulo
  IdPagina: number;         // ID de la Página
  Pagina?: string;          // ✅ NUEVO: Nombre de la Página
  sDescripcion: string;
  IdTipo: number;
  IdPrioridad: number;
  IdEstado: number;
  IdInpacto: number;
  sVersion: string | null;
}

export interface TicketFilter {
  Usuario?: number;
  Modulo?: number;      // Antes: Aplicacion
  Pagina?: number;      // Antes: Modulo
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

export interface TicketCreateRequest {
  codigo: string;
  descripcion: string;
  idSistema: number;          // ✅ NUEVO: Sistema (jerarquía nivel 1)
  idModulo: number;           // Módulo (jerarquía nivel 2)
  idPagina?: number | null;   // Página (jerarquía nivel 3)
  idTipo?: number | null;
  idEstado?: number | null;
  idPrioridad?: number | null;
  idImpacto?: number | null;
}

export interface TicketUpdateRequest {
  codigo?: string;
  descripcion?: string;
  idSistema?: number | null;    // ✅ NUEVO: Sistema (jerarquía nivel 1)
  idModulo?: number | null;     // Módulo (jerarquía nivel 2)
  idPagina?: number | null;     // Página (jerarquía nivel 3)
  idTipo?: number | null;
  idEstado?: number | null;
  idPrioridad?: number | null;
  idImpacto?: number | null;
}

