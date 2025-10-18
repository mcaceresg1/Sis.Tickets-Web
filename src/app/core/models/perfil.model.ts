/**
 * Modelo de Perfil para lista
 */
export interface PerfilList {
  IdPerfil: number;
  Perfil: string;
}

/**
 * Modelo de Perfil básico
 */
export interface Perfil {
  IdPerfil: number;
  IdEmpresa?: number;
  Perfil: string;
  sEstado?: string;
}

/**
 * Request para crear un perfil
 */
export interface PerfilCreateRequest {
  IdEmpresa: number;
  Nombre: string;
  Usuario?: string;
}

/**
 * Request para actualizar un perfil
 */
export interface PerfilUpdateRequest {
  IdEmpresa: number;
  Nombre: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Perfil
 */
export interface PerfilApiResponse {
  success: boolean;
  message: string;
}

