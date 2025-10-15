import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';
import { Ticket, TicketFilter } from '../../../../core/models/ticket.model';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { TicketUpdateComponent } from '../ticket-update/ticket-update.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketDetailComponent, TicketFormComponent, TicketUpdateComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);

  @ViewChild(TicketDetailComponent) ticketDetailModal!: TicketDetailComponent;
  @ViewChild(TicketFormComponent) ticketFormModal!: TicketFormComponent;
  @ViewChild(TicketUpdateComponent) ticketUpdateModal!: TicketUpdateComponent;

  tickets: Ticket[] = [];
  loading = false;
  errorMessage = '';
  
  // Paginación
  paginaActual = 1;
  totalPaginas = 0;
  total = 0;
  cantidadPorPagina = 10;

  // Filtros
  filtros: TicketFilter = {
    numPagina: 1,
    allReg: 0,
    iCantFilas: 10
  };

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.ticketService.listarTickets(this.filtros).subscribe({
      next: (response) => {
        this.loading = false;
        this.tickets = response.tickets || [];
        this.total = response.total || 0;
        this.totalPaginas = response.totalPaginas || 0;
        this.paginaActual = response.paginaActual || 1;
        this.cantidadPorPagina = response.cantidadPorPagina || 10;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar tickets';
        console.error('Error:', error);
      }
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.filtros.numPagina = pagina;
      this.cargarTickets();
    }
  }

  cambiarCantidadPorPagina(cantidad: number): void {
    this.filtros.iCantFilas = cantidad;
    this.filtros.numPagina = 1;
    this.cargarTickets();
  }

  aplicarFiltros(filtros: Partial<TicketFilter>): void {
    this.filtros = {
      ...this.filtros,
      ...filtros,
      numPagina: 1 // Reiniciar a la primera página al aplicar filtros
    };
    this.cargarTickets();
  }

  limpiarFiltros(): void {
    this.filtros = {
      numPagina: 1,
      allReg: 0,
      iCantFilas: 10
    };
    this.cargarTickets();
  }

  verDetalle(id: number): void {
    this.ticketDetailModal.abrirModal(id);
  }

  nuevoTicket(): void {
    this.ticketFormModal.abrirModal();
  }

  editarTicket(id: number): void {
    this.ticketUpdateModal.abrirModal(id);
  }

  onTicketCreado(): void {
    // Recargar la lista de tickets cuando se crea uno nuevo
    this.cargarTickets();
  }

  onTicketActualizado(): void {
    // Recargar la lista de tickets cuando se actualiza uno
    this.cargarTickets();
  }

  get paginaInicio(): number {
    return (this.paginaActual - 1) * this.cantidadPorPagina + 1;
  }

  get paginaFin(): number {
    return Math.min(this.paginaActual * this.cantidadPorPagina, this.total);
  }

  get paginas(): number[] {
    const paginas = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
}

