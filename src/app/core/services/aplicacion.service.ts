import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Aplicacion, AplicacionList, AplicacionCreateRequest, AplicacionUpdateRequest, AplicacionApiResponse } from '../models/aplicacion.model';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aplicaciones`;

  /**
   * Listar todas las aplicaciones activas por empresa
   */
  listarAplicaciones(idEmpresa: number): Observable<AplicacionList[]> {
    const params = new HttpParams().set('IdEmpresa', idEmpresa.toString());
    return this.http.get<AplicacionList[]>(this.apiUrl, { params });
  }

  /**
   * Obtener una aplicación por ID
   */
  obtenerAplicacion(id: number): Observable<Aplicacion> {
    return this.http.get<Aplicacion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva aplicación
   */
  crearAplicacion(aplicacion: AplicacionCreateRequest): Observable<AplicacionApiResponse> {
    return this.http.post<AplicacionApiResponse>(this.apiUrl, aplicacion);
  }

  /**
   * Actualizar una aplicación existente
   */
  actualizarAplicacion(id: number, aplicacion: AplicacionUpdateRequest): Observable<AplicacionApiResponse> {
    return this.http.put<AplicacionApiResponse>(`${this.apiUrl}/${id}`, aplicacion);
  }
}

