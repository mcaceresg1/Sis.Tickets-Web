/**
 * Modelo de Módulo para lista (con prefijo en código)
 */
export interface ModuloList {
  IdModulo: number;
  sCodigo: string;
  sDescripcion: string;
  IdSistema?: number;
}

/**
 * Modelo de Módulo básico
 */
export interface Modulo {
  IdModulo: number;
  sCodigo: string;
  sDescripcion: string;
  IdSistema?: number;
  sEstado?: string;
}

/**
 * Request para crear un módulo
 */
export interface ModuloCreateRequest {
  sCodigo: string;
  sDescripcion: string;
  IdSistema: number;
  Usuario?: string;
}

/**
 * Request para actualizar un módulo
 */
export interface ModuloUpdateRequest {
  sCodigo: string;
  sDescripcion: string;
  IdSistema: number;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Módulo
 */
export interface ModuloApiResponse {
  success: boolean;
  message: string;
}
