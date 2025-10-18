/**
 * Interface para items de combo/dropdown
 */
export interface ComboItem {
  Id: number;
  Descripcion: string;
  text: string;
}

/**
 * Enum con los IDs de combos disponibles
 */
export enum ComboType {
  PAIS = 1,
  UBICACION = 2,
  PRIORIDAD = 3,
  ESTADO_TICKET = 4,
  NIVEL_URGENCIA = 5,
  PAIS_ALT = 6,
  SUCURSAL = 7,
  TIPO_DOCUMENTO = 8,
  APLICACION = 9,
  USUARIO = 10,
  MODULOS = 11,
  TIPO_INCIDENCIA = 12,
  PRIORIDAD_ALT = 13,
  ESTADO_ALT = 14,
  URGENCIA_ALT = 15,
  EMPRESA = 16,
  TIPO_EMPRESA = 17,
  PERFIL = 18,
}

