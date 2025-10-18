import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaCreateRequest, EmpresaUpdateRequest, EmpresaApiResponse } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/empresas`;

  /**
   * Listar todas las empresas activas
   */
  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  /**
   * Obtener una empresa por ID
   */
  obtenerEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva empresa
   */
  crearEmpresa(empresa: EmpresaCreateRequest): Observable<EmpresaApiResponse> {
    return this.http.post<EmpresaApiResponse>(this.apiUrl, empresa);
  }

  /**
   * Actualizar una empresa existente
   */
  actualizarEmpresa(id: number, empresa: EmpresaUpdateRequest): Observable<EmpresaApiResponse> {
    return this.http.put<EmpresaApiResponse>(`${this.apiUrl}/${id}`, empresa);
  }
}

