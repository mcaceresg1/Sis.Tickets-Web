/**
 * Modelo de DetalleGeneral
 * Usado para Prioridad, Estado e Impacto/Nivel de Urgencia
 */
export interface DetalleGeneral {
  Id: number;
  IdCabecera: number;
  nCodIte: number;
  vTe1Gen: string;
  UserReg?: string;
  dFechaReg?: Date;
  UserMod?: string;
  dFechaMod?: Date;
  sEstado?: string;
}

/**
 * Request para crear un detalle
 */
export interface DetalleGeneralCreateRequest {
  IdCabecera: number;
  nCodIte: number;
  vTe1Gen: string;
  Usuario?: string;
}

/**
 * Request para actualizar un detalle
 */
export interface DetalleGeneralUpdateRequest {
  IdCabecera: number;
  nCodIte: number;
  vTe1Gen: string;
  Usuario?: string;
}

/**
 * Response de la API para operaciones de DetalleGeneral
 */
export interface DetalleGeneralApiResponse {
  success: boolean;
  message: string;
}

/**
 * Enum para los tipos de cabecera
 */
export enum TipoCabecera {
  PRIORIDAD = 3,
  ESTADO = 4,
  IMPACTO = 5
}

