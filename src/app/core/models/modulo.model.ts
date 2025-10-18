/**
 * Modelo de Módulo para lista (con join a Aplicación)
 */
export interface ModuloList {
  IdModulo: number;
  sCodigo: string;
  sDescripcion: string;
  Aplicacion: string;
  IdAplicacion: number;
}

/**
 * Modelo de Módulo básico
 */
export interface Modulo {
  IdModulo: number;
  sCodigo: string;
  sDescripcion: string;
  Idaplicacion: number;
  sEstado?: string;
}

/**
 * Request para crear un módulo
 */
export interface ModuloCreateRequest {
  sCodigo: string;
  sDescripcion: string;
  Idaplicacion: number;
  Usuario?: string;
}

/**
 * Request para actualizar un módulo
 */
export interface ModuloUpdateRequest {
  sCodigo: string;
  sDescripcion: string;
  Idaplicacion: number;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Módulo
 */
export interface ModuloApiResponse {
  success: boolean;
  message: string;
}

