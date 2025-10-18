import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoEmpresa, TipoEmpresaCreateRequest, TipoEmpresaUpdateRequest, TipoEmpresaApiResponse } from '../models/tipoEmpresa.model';

@Injectable({
  providedIn: 'root'
})
export class TipoEmpresaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tipo-empresa`;

  /**
   * Listar todos los tipos de empresa activos
   */
  listarTipoEmpresas(): Observable<TipoEmpresa[]> {
    return this.http.get<TipoEmpresa[]>(this.apiUrl);
  }

  /**
   * Obtener un tipo de empresa por ID
   */
  obtenerTipoEmpresa(id: number): Observable<TipoEmpresa> {
    return this.http.get<TipoEmpresa>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo tipo de empresa
   */
  crearTipoEmpresa(tipoEmpresa: TipoEmpresaCreateRequest): Observable<TipoEmpresaApiResponse> {
    return this.http.post<TipoEmpresaApiResponse>(this.apiUrl, tipoEmpresa);
  }

  /**
   * Actualizar un tipo de empresa existente
   */
  actualizarTipoEmpresa(id: number, tipoEmpresa: TipoEmpresaUpdateRequest): Observable<TipoEmpresaApiResponse> {
    return this.http.put<TipoEmpresaApiResponse>(`${this.apiUrl}/${id}`, tipoEmpresa);
  }
}

