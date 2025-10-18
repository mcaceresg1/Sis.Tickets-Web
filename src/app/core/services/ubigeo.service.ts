import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface para Ubicaciones (Ubigeo)
 */
export interface UbigeoItem {
  sIdPais: string;
  sIdDep: string;
  sIdProv: string;
  sIdDistrito: string;
  sDescUbigeo: string;
}

/**
 * Servicio para obtener datos de Ubigeo (Departamentos, Provincias, Distritos)
 */
@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private apiUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) {
    console.log('🌍 UbigeoService inicializado');
    console.log('📡 API URL:', this.apiUrl);
  }

  /**
   * Obtener Departamentos por País
   * @param idPais - ID del país (ej: "01", "02")
   * @returns Observable con array de departamentos
   */
  getDepartamentosPorPais(idPais: string): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.apiUrl}/departamentos/${idPais}`);
  }

  /**
   * Obtener Provincias por País y Departamento
   * @param idPais - ID del país (ej: "01")
   * @param idDepartamento - ID del departamento (ej: "15")
   * @returns Observable con array de provincias
   */
  getProvinciasPorDepartamento(idPais: string, idDepartamento: string): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.apiUrl}/provincias/${idPais}/${idDepartamento}`);
  }

  /**
   * Obtener Distritos por País, Departamento y Provincia
   * @param idPais - ID del país (ej: "01")
   * @param idDepartamento - ID del departamento (ej: "15")
   * @param idProvincia - ID de la provincia (ej: "01")
   * @returns Observable con array de distritos
   */
  getDistritosPorProvincia(idPais: string, idDepartamento: string, idProvincia: string): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.apiUrl}/distritos/${idPais}/${idDepartamento}/${idProvincia}`);
  }
}

