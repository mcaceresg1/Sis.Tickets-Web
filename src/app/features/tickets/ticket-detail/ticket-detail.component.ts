import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketDetail } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent {
  private ticketService = inject(TicketService);

  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  loading = false;
  errorMessage = '';
  ticket: TicketDetail | null = null;
  ticketId: number | null = null;

  abrirModal(id: number): void {
    this.ticketId = id;
    this.isOpen = true;
    this.cargarTicket(id);
  }

  cerrarModal(): void {
    this.isOpen = false;
    this.ticket = null;
    this.ticketId = null;
    this.errorMessage = '';
    this.closed.emit();
  }

  private cargarTicket(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.ticketService.obtenerTicket(id).subscribe({
      next: (data) => {
        this.loading = false;
        this.ticket = data;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar el detalle del ticket';
        console.error('Error:', error);
      }
    });
  }
}
