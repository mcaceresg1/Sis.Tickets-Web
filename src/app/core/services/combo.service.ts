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
   * Obtener combo de Módulos (antes Aplicaciones)
   */
  getModulos(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.MODULO);
  }

  /**
   * Obtener módulos filtrados por sistema
   * @param idSistema - ID del sistema para filtrar módulos
   */
  getModulosPorSistema(idSistema: number): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/modulos/${idSistema}`);
  }

  /**
   * Obtener combo de Usuarios
   */
  getUsuarios(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.USUARIO);
  }

  /**
   * Obtener combo de Páginas (todas - antes Módulos)
   */
  getPaginas(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.PAGINAS);
  }

  /**
   * Obtener páginas filtradas por módulo
   * @param idModulo - ID del módulo para filtrar páginas
   */
  getPaginasPorModulo(idModulo: number): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/paginas/${idModulo}`);
  }

  /**
   * Obtener TODAS las páginas (activas e inactivas)
   * Para uso en vistas de solo lectura (detalle de ticket)
   */
  getAllPaginas(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/paginas/all`);
  }

  /**
   * Obtener combo de Sistemas (ID = 16)
   */
  getSistemas(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.SISTEMA);
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

  /**
   * Obtener combo de Menús
   */
  getMenus(): Observable<ComboItem[]> {
    return this.getComboById(ComboType.MENU);
  }

  /**
   * Obtener combo de Sistemas (filtrado por usuario)
   * Si el usuario es ADMIN (perfil 1): Ve todos los sistemas
   * Si NO es admin: Ve solo su sistema
   */
  getSistemasDelUsuario(): Observable<ComboItem[]> {
    // El backend determinará qué sistemas mostrar según el perfil del usuario en el JWT
    return this.http.get<ComboItem[]>(`${this.apiUrl}/sistemas-usuario`);
  }
}

