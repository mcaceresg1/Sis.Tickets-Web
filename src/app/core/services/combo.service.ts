import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComboItem, ComboType } from '../models/combo.model';

/**
 * Servicio para obtener datos de combos/dropdowns
 */
@Injectable({
  providedIn: 'root'
})
export class ComboService {
  private apiUrl = `${environment.apiUrl}/combos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener items para un combo específico
   * @param comboId - ID del tipo de combo (usar ComboType enum)
   * @returns Observable con array de items del combo
   */
  getComboById(comboId: ComboType | number): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/${comboId}`);
  }

  /**
   * Obtener combo de Países
   */
  getPaises(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.PAIS);
  }

  /**
   * Obtener combo de Prioridades
   */
  getPrioridades(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.PRIORIDAD);
  }

  /**
   * Obtener combo de Estados de Ticket
   */
  getEstados(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.ESTADO_TICKET);
  }

  /**
   * Obtener combo de Niveles de Urgencia/Impacto
   */
  getNivelesUrgencia(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.NIVEL_URGENCIA);
  }

  /**
   * Obtener combo de Sucursales
   */
  getSucursales(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.SUCURSAL);
  }

  /**
   * Obtener combo de Tipos de Documento
   */
  getTiposDocumento(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.TIPO_DOCUMENTO);
  }

  /**
   * Obtener combo de Aplicaciones
   */
  getAplicaciones(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.APLICACION);
  }

  /**
   * Obtener combo de Usuarios
   */
  getUsuarios(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.USUARIO);
  }

  /**
   * Obtener combo de Módulos (todos)
   */
  getModulos(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.MODULOS);
  }

  /**
   * Obtener módulos filtrados por aplicación
   * @param idAplicacion - ID de la aplicación para filtrar módulos
   */
  getModulosPorAplicacion(idAplicacion: number): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/modulos/${idAplicacion}`);
  }

  /**
   * Obtener TODOS los módulos (activos e inactivos)
   * Para uso en vistas de solo lectura (detalle de ticket)
   */
  getAllModulos(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/modulos/all`);
  }

  /**
   * Obtener combo de Tipos de Incidencia
   */
  getTiposIncidencia(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.TIPO_INCIDENCIA);
  }

  /**
   * Obtener combo de Empresas
   */
  getEmpresas(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.EMPRESA);
  }

  /**
   * Obtener combo de Tipos de Empresa
   */
  getTiposEmpresa(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.TIPO_EMPRESA);
  }

  /**
   * Obtener combo de Perfiles
   */
  getPerfiles(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.PERFIL);
  }
}

