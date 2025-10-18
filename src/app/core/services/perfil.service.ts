import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Perfil, PerfilList, PerfilCreateRequest, PerfilUpdateRequest, PerfilApiResponse } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/perfiles`;

  /**
   * Listar todos los perfiles según el perfil del usuario
   * Si idPerfil = 1 (ADMINISTRADOR): retorna todos los perfiles
   * Si idPerfil != 1: retorna solo perfiles de la empresa
   */
  listarPerfiles(idEmpresa: number, idPerfil: number): Observable<PerfilList[]> {
    const params = new HttpParams()
      .set('idEmpresa', idEmpresa.toString())
      .set('idPerfil', idPerfil.toString());
    return this.http.get<PerfilList[]>(this.apiUrl, { params });
  }

  /**
   * Obtener un perfil por ID
   */
  obtenerPerfil(id: number): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo perfil
   */
  crearPerfil(perfil: PerfilCreateRequest): Observable<PerfilApiResponse> {
    return this.http.post<PerfilApiResponse>(this.apiUrl, perfil);
  }

  /**
   * Actualizar un perfil existente
   */
  actualizarPerfil(id: number, perfil: PerfilUpdateRequest): Observable<PerfilApiResponse> {
    return this.http.put<PerfilApiResponse>(`${this.apiUrl}/${id}`, perfil);
  }
}

