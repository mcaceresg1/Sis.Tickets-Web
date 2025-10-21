import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagina, PaginaList, PaginaCreateRequest, PaginaUpdateRequest, PaginaApiResponse } from '../models/pagina.model';

@Injectable({
  providedIn: 'root'
})
export class PaginaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paginas`;

  /**
   * Listar todas las páginas activas por empresa
   */
  listarPaginas(idEmpresa: number): Observable<PaginaList[]> {
    const params = new HttpParams().set('IdEmpresa', idEmpresa.toString());
    return this.http.get<PaginaList[]>(this.apiUrl, { params });
  }

  /**
   * Obtener una página por ID
   */
  obtenerPagina(id: number): Observable<Pagina> {
    return this.http.get<Pagina>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva página
   */
  crearPagina(pagina: PaginaCreateRequest): Observable<PaginaApiResponse> {
    return this.http.post<PaginaApiResponse>(this.apiUrl, pagina);
  }

  /**
   * Actualizar una página existente
   */
  actualizarPagina(id: number, pagina: PaginaUpdateRequest): Observable<PaginaApiResponse> {
    return this.http.put<PaginaApiResponse>(`${this.apiUrl}/${id}`, pagina);
  }
}

