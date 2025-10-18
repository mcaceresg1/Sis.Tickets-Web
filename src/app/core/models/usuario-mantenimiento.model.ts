/**
 * Modelo de Usuario para lista (vista simplificada)
 */
export interface UsuarioList {
  iID_Usuario: number;
  Perfil: string;
  sRazonSocialE: string;
  Sucursal: string;
  NumDoc: string;
  Pais: string;
  scargo: string;
  sUsuario: string;
  Nombres: string;
  sCorreoElectronico: string;
  sDireccion: string;
  sTelefono: string;
  workgroup1: string;
  workgroup2: string;
  workgroup3: string;
  IdAplicacion?: string;  // IDs separados por comas: "1,2,4"
  IdModulo?: string;       // IDs separados por comas: "10,15,20"
}

/**
 * Modelo completo de Usuario para edición
 */
export interface UsuarioEdit {
  iId_Usuario: number;
  iId_perfilusuario: number;
  IdEmpresa: number;
  IdSucursal: number;
  iID_Pais?: string;
  iID_DocumnetoI: number;
  sUsuario: string;
  Pass: string;
  sNombres: string;
  sApePaterno: string;
  sApeMaterno: string;
  sNumDocumentoI: string;
  sImgen?: string;
  sDireccion?: string;
  sTelefono?: string;
  sCorreoElectronico?: string;
  sCargo?: string;
  workgroup1?: string;
  workgroup2?: string;
  workgroup3?: string;
  workgroup4?: string;
  workgroup5?: string;
  workgroup6?: string;
  workgroup7?: string;
  workgroup8?: string;
  workgroup9?: string;
  workgroup10?: string;
  IdAplicacion?: string | number;
  IdModulo?: string | number;
  sImpacto?: string | number;
  sPrioridad?: string | number;
  sEstadoC?: string | number;
}

/**
 * Request para crear un usuario
 */
export interface UsuarioCreateRequest {
  sUsuario: string;
  sClave: string;
  sNombre: string;
  ApePaterno: string;
  ApeMaterno: string;
  IdPerfil: number;
  IdEmpresa: number;
  IdSucursal: number;
  IdDocumento: number | string | null;
  sNumero: string;
  Correo?: string;
  sTelefono?: string;
  sDireccion?: string;
  sCargo?: string;
  sImagen?: string;
  workgroup1?: string;
  workgroup2?: string;
  workgroup3?: string;
  IdAplicacion?: string;  // String "1,2,3" para multiselect
  IdModulo?: string;      // String "1,2,3" para multiselect
  sImpacto?: number | null;
  sPrioridad?: number | null;
  sEstadoC?: number | null;
  Usuario?: string;
}

/**
 * Request para actualizar un usuario
 */
export interface UsuarioUpdateRequest {
  sUsuario: string;
  sClave: string;
  sNombre: string;
  ApePaterno: string;
  ApeMaterno: string;
  IdPerfil: number;
  IdEmpresa: number;
  IdSucursal: number;
  IdDocumento: number | string | null;
  sNumero: string;
  Correo?: string;
  sTelefono?: string;
  sDireccion?: string;
  sCargo?: string;
  sImagen?: string;
  workgroup1?: string;
  workgroup2?: string;
  workgroup3?: string;
  IdAplicacion?: string;  // String "1,2,3" para multiselect
  IdModulo?: string;      // String "1,2,3" para multiselect
  sImpacto?: number | null;
  sPrioridad?: number | null;
  sEstadoC?: number | null;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de Usuario
 */
export interface UsuarioApiResponse {
  success: boolean;
  message: string;
}

