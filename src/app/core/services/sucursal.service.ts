import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sucursal, SucursalList, SucursalCreateRequest, SucursalUpdateRequest, SucursalApiResponse } from '../models/sucursal.model';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sucursales`;

  /**
   * Listar todas las sucursales activas por empresa
   */
  listarSucursales(idEmpresa: number): Observable<SucursalList[]> {
    const params = new HttpParams().set('IdEmpresa', idEmpresa.toString());
    return this.http.get<SucursalList[]>(this.apiUrl, { params });
  }

  /**
   * Obtener una sucursal por ID
   */
  obtenerSucursal(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva sucursal
   */
  crearSucursal(sucursal: SucursalCreateRequest): Observable<SucursalApiResponse> {
    return this.http.post<SucursalApiResponse>(this.apiUrl, sucursal);
  }

  /**
   * Actualizar una sucursal existente
   */
  actualizarSucursal(id: number, sucursal: SucursalUpdateRequest): Observable<SucursalApiResponse> {
    return this.http.put<SucursalApiResponse>(`${this.apiUrl}/${id}`, sucursal);
  }
}

