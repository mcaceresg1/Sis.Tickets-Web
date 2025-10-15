import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);

  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.loading = true;
    this.ticketService.listarTickets().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.tickets = response.data;
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar tickets';
        console.error('Error:', error);
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  nuevoTicket(): void {
    this.router.navigate(['/tickets/new']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}

