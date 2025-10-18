import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../../../core/services/ticket.service';
import { ComboService } from '../../../../core/services/combo.service';
import { TicketDetail } from '../../../../core/models/ticket.model';
import { ComboItem } from '../../../../core/models/combo.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent {
  private ticketService = inject(TicketService);
  private comboService = inject(ComboService);

  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  loading = false;
  errorMessage = '';
  ticket: TicketDetail | null = null;
  ticketId: number | null = null;

  // Mapeos de IDs a descripciones
  usuarios: Map<number, string> = new Map();
  modulos: Map<number, string> = new Map();
  aplicaciones: Map<number, string> = new Map();
  tiposIncidencia: Map<number, string> = new Map();
  prioridades: Map<number, string> = new Map();
  estados: Map<number, string> = new Map();
  impactos: Map<number, string> = new Map();

  abrirModal(id: number): void {
    this.ticketId = id;
    this.isOpen = true;
    this.cargarDatosCompletos(id);
  }

  cerrarModal(): void {
    this.isOpen = false;
    this.ticket = null;
    this.ticketId = null;
    this.errorMessage = '';
    this.closed.emit();
  }

  private cargarDatosCompletos(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    // Primero cargar el ticket
    this.ticketService.obtenerTicket(id).subscribe({
      next: (ticket) => {
        this.ticket = ticket;

        // Ahora cargar todos los combos
        // IMPORTANTE: Para el detalle, cargamos TODOS los módulos (activos e inactivos)
        // para garantizar que el módulo del ticket esté en el mapeo
        forkJoin({
          usuarios: this.comboService.getUsuarios(),
          modulos: this.comboService.getAllModulos(), // Cargar TODOS los módulos (incluso inactivos)
          aplicaciones: this.comboService.getAplicaciones(),
          tiposIncidencia: this.comboService.getTiposIncidencia(),
          prioridades: this.comboService.getPrioridades(),
          estados: this.comboService.getEstados(),
          impactos: this.comboService.getNivelesUrgencia()
        }).subscribe({
          next: (resultado) => {
            this.loading = false;

            // Crear mapeos de ID a Descripción
            this.usuarios = this.crearMapeo(resultado.usuarios);
            this.modulos = this.crearMapeo(resultado.modulos);
            this.aplicaciones = this.crearMapeo(resultado.aplicaciones);
            this.tiposIncidencia = this.crearMapeo(resultado.tiposIncidencia);
            this.prioridades = this.crearMapeo(resultado.prioridades);
            this.estados = this.crearMapeo(resultado.estados);
            this.impactos = this.crearMapeo(resultado.impactos);

            console.log('✅ Detalle del ticket cargado con descripciones');
            console.log('Módulos mapeados:', this.modulos);
            console.log('ID Módulo del ticket:', this.ticket?.IdModulo);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'Error al cargar los catálogos';
            console.error('Error:', error);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar el detalle del ticket';
        console.error('Error:', error);
      }
    });
  }

  private crearMapeo(items: ComboItem[]): Map<number, string> {
    const mapa = new Map<number, string>();
    items.forEach(item => {
      mapa.set(item.Id, item.Descripcion);
    });
    return mapa;
  }

  // Métodos helper para obtener descripciones
  obtenerUsuario(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.usuarios.get(id) || `ID: ${id}`;
  }

  obtenerModulo(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.modulos.get(id) || `ID: ${id}`;
  }

  obtenerAplicacion(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.aplicaciones.get(id) || `ID: ${id}`;
  }

  obtenerTipoIncidencia(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.tiposIncidencia.get(id) || `ID: ${id}`;
  }

  obtenerPrioridad(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.prioridades.get(id) || `ID: ${id}`;
  }

  obtenerEstado(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.estados.get(id) || `ID: ${id}`;
  }

  obtenerImpacto(id: number | null | undefined): string {
    if (!id) return 'N/A';
    return this.impactos.get(id) || `ID: ${id}`;
  }
}
