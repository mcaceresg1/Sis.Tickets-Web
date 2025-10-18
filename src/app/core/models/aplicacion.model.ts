/**
 * Modelo de Aplicación para lista (con prefijo en código)
 */
export interface AplicacionList {
  IdApli: number;
  sCodigo: string;
  sDescripcion: string;
}

/**
 * Modelo de Aplicación básico
 */
export interface Aplicacion {
  IdApli: number;
  sCodigo: string;
  sDescripcion: string;
  sEstado?: string;
}

/**
 * Request para crear una aplicación
 */
export interface AplicacionCreateRequest {
  sCodigo: string;
  sDescripcion: string;
  Usuario?: string;
}

/**
 * Request para actualizar una aplicación
 */
export interface AplicacionUpdateRequest {
  sCodigo: string;
  sDescripcion: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Aplicación
 */
export interface AplicacionApiResponse {
  success: boolean;
  message: string;
}

