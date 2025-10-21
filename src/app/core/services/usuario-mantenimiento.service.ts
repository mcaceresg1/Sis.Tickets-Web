import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioList, UsuarioEdit, UsuarioCreateRequest, UsuarioUpdateRequest, UsuarioApiResponse } from '../models/usuario-mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioMantenimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios-mantenimiento`;

  /**
   * Listar todos los usuarios activos con información completa
   * @param idEmpresa - ID de la empresa para filtrar usuarios (opcional)
   */
  listarUsuarios(idEmpresa?: number): Observable<UsuarioList[]> {
    const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : '';
    return this.http.get<UsuarioList[]>(`${this.apiUrl}${params}`);
  }

  /**
   * Obtener un usuario por ID para edición
   * Incluye la contraseña desencriptada
   */
  obtenerUsuario(id: number): Observable<UsuarioEdit> {
    return this.http.get<UsuarioEdit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   * La contraseña se encripta automáticamente en el servidor
   */
  crearUsuario(usuario: UsuarioCreateRequest): Observable<UsuarioApiResponse> {
    return this.http.post<UsuarioApiResponse>(this.apiUrl, usuario);
  }

  /**
   * Actualizar un usuario existente
   * La contraseña se encripta automáticamente en el servidor
   */
  actualizarUsuario(id: number, usuario: UsuarioUpdateRequest): Observable<UsuarioApiResponse> {
    return this.http.put<UsuarioApiResponse>(`${this.apiUrl}/${id}`, usuario);
  }
}

