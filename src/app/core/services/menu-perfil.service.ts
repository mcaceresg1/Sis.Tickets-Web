import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  MenuPerfil, 
  MenuPerfilCreateRequest, 
  MenuPerfilUpdateRequest, 
  MenuPerfilApiResponse 
} from '../models/menu-perfil.model';

@Injectable({
  providedIn: 'root'
})
export class MenuPerfilService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/menu-perfil`;

  /**
   * Listar todas las asignaciones de menú a perfil activas
   */
  listarMenuPerfil(): Observable<MenuPerfil[]> {
    return this.http.get<MenuPerfil[]>(this.apiUrl);
  }

  /**
   * Obtener una asignación por IDs
   */
  obtenerMenuPerfil(idPerfil: number, idMenu: number): Observable<MenuPerfil> {
    return this.http.get<MenuPerfil>(`${this.apiUrl}/${idPerfil}/${idMenu}`);
  }

  /**
   * Crear una nueva asignación de menú a perfil
   */
  crearMenuPerfil(menuPerfilData: MenuPerfilCreateRequest): Observable<MenuPerfilApiResponse> {
    return this.http.post<MenuPerfilApiResponse>(this.apiUrl, menuPerfilData);
  }

  /**
   * Actualizar una asignación existente
   */
  actualizarMenuPerfil(
    idPerfil: number, 
    idMenu: number, 
    menuPerfilData: MenuPerfilUpdateRequest
  ): Observable<MenuPerfilApiResponse> {
    return this.http.put<MenuPerfilApiResponse>(`${this.apiUrl}/${idPerfil}/${idMenu}`, menuPerfilData);
  }

  /**
   * Eliminar una asignación
   */
  eliminarMenuPerfil(idPerfil: number, idMenu: number, usuario: string): Observable<MenuPerfilApiResponse> {
    return this.http.delete<MenuPerfilApiResponse>(`${this.apiUrl}/${idPerfil}/${idMenu}`, {
      body: { Usuario: usuario }
    });
  }
}

