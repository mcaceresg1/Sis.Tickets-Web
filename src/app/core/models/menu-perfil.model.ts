/**
 * Modelo para Asignación de Menú a Perfil
 */

/**
 * Interface para la entidad MenuPerfil completa
 */
export interface MenuPerfil {
  iID_PerfilUsuario: number;
  iID_Menu: number;
  PerfilNombre: string;
  MenuDescripcion: string;
  MenuVista: string;
  MenuControlador: string;
  sUserReg?: string;
  dFechaReg?: Date;
  sUserMod?: string;
  dFechaMod?: Date;
  sEstado?: string;
}

/**
 * Interface para crear una nueva asignación de menú a perfil
 */
export interface MenuPerfilCreateRequest {
  iID_PerfilUsuario: number;
  iID_Menu: number;
  Usuario?: string;
}

/**
 * Interface para actualizar una asignación existente
 */
export interface MenuPerfilUpdateRequest {
  iID_PerfilUsuario: number;
  iID_Menu: number;
  Usuario?: string;
}

/**
 * Interface para la respuesta de la API al crear/actualizar
 */
export interface MenuPerfilApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

