/**
 * Modelo de País
 */
export interface Pais {
  IdPais: number;
  sIdPais?: string;
  sCodigo: string;
  sDesc: string;
  sEstado?: string;
}

/**
 * Request para crear un país
 */
export interface PaisCreateRequest {
  sCodigo: string;
  sDesc: string;
  Usuario?: string;
}

/**
 * Request para actualizar un país
 */
export interface PaisUpdateRequest {
  sCodigo: string;
  sDesc: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de País
 */
export interface PaisApiResponse {
  success: boolean;
  message: string;
}

