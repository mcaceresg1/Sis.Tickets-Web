import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pais, PaisCreateRequest, PaisUpdateRequest, PaisApiResponse } from '../models/pais.model';

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pais`;

  /**
   * Listar todos los países activos
   */
  listarPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiUrl);
  }

  /**
   * Obtener un país por ID
   */
  obtenerPais(id: number): Observable<Pais> {
    return this.http.get<Pais>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo país
   */
  crearPais(pais: PaisCreateRequest): Observable<PaisApiResponse> {
    return this.http.post<PaisApiResponse>(this.apiUrl, pais);
  }

  /**
   * Actualizar un país existente
   */
  actualizarPais(id: number, pais: PaisUpdateRequest): Observable<PaisApiResponse> {
    return this.http.put<PaisApiResponse>(`${this.apiUrl}/${id}`, pais);
  }
}

