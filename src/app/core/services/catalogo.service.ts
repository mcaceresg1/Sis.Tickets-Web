import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Modulo, 
  Empresa, 
  Pagina,
  Pais, 
  Estado, 
  Prioridad, 
  Impacto,
  Perfil
} from '../models/catalogo.model';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mantenimiento`;

  // Módulos (antes Aplicaciones)
  listarModulos(): Observable<ApiResponse<Modulo[]>> {
    return this.http.get<ApiResponse<Modulo[]>>(`${this.apiUrl}/modulos`);
  }

  crearModulo(modulo: Partial<Modulo>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/modulo`, modulo);
  }

  // Empresas
  listarEmpresas(): Observable<ApiResponse<Empresa[]>> {
    return this.http.get<ApiResponse<Empresa[]>>(`${this.apiUrl}/empresas`);
  }

  crearEmpresa(empresa: Partial<Empresa>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa`, empresa);
  }

  // Módulos
  listarPaginas(idModulo: number): Observable<ApiResponse<Pagina[]>> {
    return this.http.get<ApiResponse<Pagina[]>>(`${this.apiUrl}/Paginas/${idModulo}`);
  }

  // Países
  listarPaises(): Observable<ApiResponse<Pais[]>> {
    return this.http.get<ApiResponse<Pais[]>>(`${this.apiUrl}/paises`);
  }

  // Estados
  listarEstados(idEmpresa: number): Observable<ApiResponse<Estado[]>> {
    return this.http.get<ApiResponse<Estado[]>>(`${this.apiUrl}/estados/${idEmpresa}`);
  }

  // Prioridades
  listarPrioridades(idEmpresa: number): Observable<ApiResponse<Prioridad[]>> {
    return this.http.get<ApiResponse<Prioridad[]>>(`${this.apiUrl}/prioridades/${idEmpresa}`);
  }

  // Impactos
  listarImpactos(idEmpresa: number): Observable<ApiResponse<Impacto[]>> {
    return this.http.get<ApiResponse<Impacto[]>>(`${this.apiUrl}/impactos/${idEmpresa}`);
  }
}

