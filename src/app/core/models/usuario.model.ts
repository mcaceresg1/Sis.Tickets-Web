export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  idTipoDocumento?: number;
  nroDocumento?: string;
  idPerfil: number;
  perfil: string;
  sImgen?: string;
  idEmpresa: number;
  sRazonSocialE: string;
  activo: number;
}

export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  success: boolean;
  user?: Usuario;
  message?: string;
  token?: string;
}

