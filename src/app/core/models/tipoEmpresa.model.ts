/**
 * Modelo de Tipo Empresa
 */
export interface TipoEmpresa {
  IdTipo: number;
  sCodigo: string;
  sDescripcion: string;
  sEstado?: string;
}

/**
 * Request para crear un tipo de empresa
 */
export interface TipoEmpresaCreateRequest {
  Codigo: string;
  sDescripcion: string;
  User?: string;
}

/**
 * Request para actualizar un tipo de empresa
 */
export interface TipoEmpresaUpdateRequest {
  Codigo: string;
  sDescripcion: string;
  User?: string;
}

/**
 * Response de la API para operaciones de Tipo Empresa
 */
export interface TipoEmpresaApiResponse {
  success: boolean;
  message: string;
}

