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
  MODULO = 9,               // Módulos (antes: Aplicación)
  USUARIO = 10,
  PAGINAS = 11,             // Páginas (antes: Módulos)
  TIPO_INCIDENCIA = 12,
  PRIORIDAD_ALT = 13,
  ESTADO_ALT = 14,
  URGENCIA_ALT = 15,
  EMPRESA = 16,
  TIPO_EMPRESA = 17,
  PERFIL = 18,
  MENU = 19,
  SISTEMA = 20,             // ✅ CORREGIDO: Sistema ahora es ID 20
}

