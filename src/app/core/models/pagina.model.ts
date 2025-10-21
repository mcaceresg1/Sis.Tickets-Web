/**
 * Modelo de Página para lista (con join a Módulo)
 */
export interface PaginaList {
  IdPagina: number;
  sCodigo: string;
  sDescripcion: string;
  Modulo: string;
  IdModulo: number;
}

/**
 * Modelo de Página básico
 */
export interface Pagina {
  IdPagina: number;
  sCodigo: string;
  sDescripcion: string;
  IdModulo: number;
  sEstado?: string;
}

/**
 * Request para crear una página
 */
export interface PaginaCreateRequest {
  sCodigo: string;
  sDescripcion: string;
  IdModulo: number;
  Usuario?: string;
}

/**
 * Request para actualizar una página
 */
export interface PaginaUpdateRequest {
  sCodigo: string;
  sDescripcion: string;
  IdModulo: number;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Página
 */
export interface PaginaApiResponse {
  success: boolean;
  message: string;
}

