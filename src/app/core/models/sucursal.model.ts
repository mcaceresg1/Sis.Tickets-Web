/**
 * Modelo de Sucursal para lista (con joins)
 */
export interface SucursalList {
  IdSucursal: number;
  sCodigo: string;
  srazonSocialE: string;
  sDescripcion: string;
  sDesc: string;
  Departamento: string;
  Provincia: string;
  Distrito: string;
  sDireccion: string;
  sTelefono: string;
  sCelular: string;
}

/**
 * Modelo de Sucursal básico
 */
export interface Sucursal {
  IdSucursal: number;
  sCodigo: string;
  IdEmpresa: number;
  IdPais: string;
  TipoEmpresa: number;
  IdDepartamento: string;
  IdProvincia: string;
  IdDistrito: string;
  sDireccion: string;
  sTelefono: string;
  sCelular: string;
  sEstado?: string;
}

/**
 * Request para crear una sucursal
 */
export interface SucursalCreateRequest {
  sCodigo: string;
  IdEmpresa: number;
  IdPais: string;
  TipoEmpresa: number;
  IdDepartamento: string;
  IdProvincia: string;
  IdDistrito: string;
  sDireccion: string;
  sTelefono: string;
  sCelular: string;
  Usuario?: string;
}

/**
 * Request para actualizar una sucursal
 */
export interface SucursalUpdateRequest {
  sCodigo: string;
  IdEmpresa: number;
  IdPais: string;
  TipoEmpresa: number;
  IdDepartamento: string;
  IdProvincia: string;
  IdDistrito: string;
  sDireccion: string;
  sTelefono: string;
  sCelular: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Sucursal
 */
export interface SucursalApiResponse {
  success: boolean;
  message: string;
}

