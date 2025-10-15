import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, TicketFilter } from '../models/ticket.model';

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
  private apiUrl = `${environment.apiUrl}/gestion`;

  listarTickets(filtro: TicketFilter = {}): Observable<ApiResponse<Ticket[]>> {
    return this.http.post<ApiResponse<Ticket[]>>(`${this.apiUrl}/tickets/listar`, filtro);
  }

  obtenerTicket(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.apiUrl}/ticket/${id}`);
  }

  crearTicket(ticket: Partial<Ticket>): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/ticket`, ticket);
  }

  actualizarTicket(id: number, ticket: Partial<Ticket>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/ticket/${id}`, ticket);
  }

  eliminarTicket(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/ticket/${id}`);
  }

  agregarComentario(idTicket: number, comentario: { texto: string, idUsuario: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ticket/${idTicket}/comentario`, comentario);
  }
}

