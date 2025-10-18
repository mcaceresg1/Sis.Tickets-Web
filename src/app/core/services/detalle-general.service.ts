import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  DetalleGeneral, 
  DetalleGeneralCreateRequest, 
  DetalleGeneralUpdateRequest, 
  DetalleGeneralApiResponse 
} from '../models/detalle-general.model';

@Injectable({
  providedIn: 'root'
})
export class DetalleGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/detalle-general`;

  /**
   * Listar todos los detalles por IdCabecera
   * @param idCabecera - 3=Prioridad, 4=Estado, 5=Impacto
   */
  listarPorCabecera(idCabecera: number): Observable<DetalleGeneral[]> {
    return this.http.get<DetalleGeneral[]>(`${this.apiUrl}/cabecera/${idCabecera}`);
  }

  /**
   * Obtener un detalle por ID
   */
  obtenerDetalle(id: number): Observable<DetalleGeneral> {
    return this.http.get<DetalleGeneral>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo detalle
   */
  crearDetalle(detalle: DetalleGeneralCreateRequest): Observable<DetalleGeneralApiResponse> {
    return this.http.post<DetalleGeneralApiResponse>(this.apiUrl, detalle);
  }

  /**
   * Actualizar un detalle existente
   */
  actualizarDetalle(id: number, detalle: DetalleGeneralUpdateRequest): Observable<DetalleGeneralApiResponse> {
    return this.http.put<DetalleGeneralApiResponse>(`${this.apiUrl}/${id}`, detalle);
  }

  /**
   * Cambiar el estado de un detalle (Activar/Desactivar)
   */
  cambiarEstado(id: number, nuevoEstado: string, usuario: string = 'ADMIN'): Observable<DetalleGeneralApiResponse> {
    return this.http.patch<DetalleGeneralApiResponse>(`${this.apiUrl}/${id}/estado`, {
      NuevoEstado: nuevoEstado,
      Usuario: usuario
    });
  }
}

