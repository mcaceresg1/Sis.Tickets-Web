/**
 * Modelo de Empresa
 */
export interface Empresa {
  iID_Empresa: number;
  sRuc: string;
  sRazonSocialE: string;
  IdAplicacion?: string | number[];  // ✅ Soporta string "1,2,3" o array [1,2,3]
  sEstado?: string;
}

/**
 * Request para crear una empresa
 */
export interface EmpresaCreateRequest {
  Codigo: string;
  RazonSocial: string;
  IdAplicacion: string;
  Usuaario?: string;
}

/**
 * Request para actualizar una empresa
 */
export interface EmpresaUpdateRequest {
  Codigo: string;
  RazonSocial: string;
  IdAplicacion: string;
  Usuaario?: string;
}

/**
 * Response de la API para operaciones de Empresa
 */
export interface EmpresaApiResponse {
  success: boolean;
  message: string;
}

