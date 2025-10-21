export interface Modulo {
  idModulo: number;
  nombreModulo: string;
  descripcion: string;
  version?: string;
  idEmpresa: number;
  nombreEmpresa: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Empresa {
  idEmpresa: number;
  nombreEmpresa: string;
  descripcion?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  idPais: number;
  nombrePais: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Pagina {
  idPagina: number;
  nombrePagina: string;
  descripcion?: string;
  idModulo: number;
  nombreModulo: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Pais {
  idPais: number;
  nombrePais: string;
  codigo?: string;
  activo: boolean;
}

export interface Estado {
  idEstado: number;
  nombreEstado: string;
  descripcion?: string;
  idEmpresa: number;
  activo: boolean;
}

export interface Prioridad {
  idPrioridad: number;
  nombrePrioridad: string;
  descripcion?: string;
  nivel: number;
  idEmpresa: number;
  activo: boolean;
}

export interface Impacto {
  idImpacto: number;
  nombreImpacto: string;
  descripcion?: string;
  nivel: number;
  idEmpresa: number;
  activo: boolean;
}

export interface Perfil {
  idPerfil: number;
  nombrePerfil: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: Date;
}

