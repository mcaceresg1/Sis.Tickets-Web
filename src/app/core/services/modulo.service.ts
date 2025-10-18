import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Modulo, ModuloList, ModuloCreateRequest, ModuloUpdateRequest, ModuloApiResponse } from '../models/modulo.model';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/modulos`;

  /**
   * Listar todos los módulos activos por empresa
   */
  listarModulos(idEmpresa: number): Observable<ModuloList[]> {
    const params = new HttpParams().set('IdEmpresa', idEmpresa.toString());
    return this.http.get<ModuloList[]>(this.apiUrl, { params });
  }

  /**
   * Obtener un módulo por ID
   */
  obtenerModulo(id: number): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo módulo
   */
  crearModulo(modulo: ModuloCreateRequest): Observable<ModuloApiResponse> {
    return this.http.post<ModuloApiResponse>(this.apiUrl, modulo);
  }

  /**
   * Actualizar un módulo existente
   */
  actualizarModulo(id: number, modulo: ModuloUpdateRequest): Observable<ModuloApiResponse> {
    return this.http.put<ModuloApiResponse>(`${this.apiUrl}/${id}`, modulo);
  }
}

