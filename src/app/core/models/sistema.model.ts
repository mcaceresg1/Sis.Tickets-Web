/**
 * Modelo de Sistema para lista
 */
export interface SistemaList {
  IdSistema: number;
  sCodigo: string;
  sDescripcion: string;
}

/**
 * Modelo de Sistema básico
 */
export interface Sistema {
  IdSistema: number;
  sCodigo: string;
  sDescripcion: string;
  sEstado?: string;
}

/**
 * Request para crear un sistema
 */
export interface SistemaCreateRequest {
  sCodigo: string;
  sDescripcion: string;
  Usuario?: string;
}

/**
 * Request para actualizar un sistema
 */
export interface SistemaUpdateRequest {
  sCodigo: string;
  sDescripcion: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Sistema
 */
export interface SistemaApiResponse {
  success: boolean;
  message: string;
}

