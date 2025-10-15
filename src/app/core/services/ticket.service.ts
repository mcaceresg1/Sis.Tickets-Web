import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, TicketDetail, TicketFilter, TicketListResponse } from '../models/ticket.model';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tickets`;

  listarTickets(filtro: TicketFilter = {}): Observable<TicketListResponse> {
    let params = new HttpParams();
    
    // Agregar parámetros de filtro si existen
    if (filtro.Usuario !== undefined) params = params.set('Usuario', filtro.Usuario.toString());
    if (filtro.Aplicacion !== undefined) params = params.set('Aplicacion', filtro.Aplicacion.toString());
    if (filtro.Modulo !== undefined) params = params.set('Modulo', filtro.Modulo.toString());
    if (filtro.Tipo !== undefined) params = params.set('Tipo', filtro.Tipo.toString());
    if (filtro.Prioridad !== undefined) params = params.set('Prioridad', filtro.Prioridad.toString());
    if (filtro.Estado !== undefined) params = params.set('Estado', filtro.Estado.toString());
    if (filtro.Inpacto !== undefined) params = params.set('Inpacto', filtro.Inpacto.toString());
    
    // Parámetros de paginación (con valores por defecto)
    params = params.set('numPagina', (filtro.numPagina || 1).toString());
    params = params.set('allReg', (filtro.allReg !== undefined ? filtro.allReg : 0).toString());
    params = params.set('iCantFilas', (filtro.iCantFilas || 10).toString());
    
    return this.http.get<TicketListResponse>(`${this.apiUrl}`, { params });
  }

  obtenerTicket(id: number): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.apiUrl}/${id}`);
  }

  crearTicket(ticket: Partial<Ticket>): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}`, ticket);
  }

  actualizarTicket(id: number, ticket: Partial<Ticket>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, ticket);
  }

  eliminarTicket(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  agregarComentario(idTicket: number, comentario: { texto: string, idUsuario: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idTicket}/comentario`, comentario);
  }
}

