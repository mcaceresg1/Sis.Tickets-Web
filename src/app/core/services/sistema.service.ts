import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sistema, SistemaList, SistemaCreateRequest, SistemaUpdateRequest, SistemaApiResponse } from '../models/sistema.model';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sistemas`;

  /**
   * Listar todos los sistemas activos
   */
  listarSistemas(): Observable<SistemaList[]> {
    return this.http.get<SistemaList[]>(this.apiUrl);
  }

  /**
   * Obtener un sistema por ID
   */
  obtenerSistema(id: number): Observable<Sistema> {
    return this.http.get<Sistema>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo sistema
   */
  crearSistema(sistemaData: SistemaCreateRequest): Observable<SistemaApiResponse> {
    return this.http.post<SistemaApiResponse>(this.apiUrl, sistemaData);
  }

  /**
   * Actualizar un sistema existente
   */
  actualizarSistema(id: number, sistemaData: SistemaUpdateRequest): Observable<SistemaApiResponse> {
    return this.http.put<SistemaApiResponse>(`${this.apiUrl}/${id}`, sistemaData);
  }
}

