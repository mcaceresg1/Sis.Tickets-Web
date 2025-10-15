import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { CatalogoService } from '../../../../core/services/catalogo.service';
import { Aplicacion, Modulo, Estado, Prioridad, Impacto } from '../../../../core/models/catalogo.model';
import { TicketDetail, TicketUpdateRequest } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-update.component.html',
  styleUrls: ['./ticket-update.component.scss']
})
export class TicketUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private catalogoService = inject(CatalogoService);

  @Output() ticketActualizado = new EventEmitter<void>();

  ticketForm!: FormGroup;
  mostrarModal = false;
  loading = false;
  loadingTicket = false;
  errorMessage = '';
  successMessage = '';

  ticketId: number = 0;
  ticketActual: TicketDetail | null = null;

  // Catálogos
  aplicaciones: Aplicacion[] = [];
  modulos: Modulo[] = [];
  estados: Estado[] = [];
  prioridades: Prioridad[] = [];
  impactos: Impacto[] = [];

  // ID de empresa fijo (ajusta según tu lógica de negocio)
  private readonly idEmpresa = 1;

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.ticketForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      descripcion: ['', [Validators.required]],
      idAplicacion: [null, [Validators.required]],
      idModulo: [null],
      idTipo: [null],
      idEstado: [null],
      idPrioridad: [null],
      idImpacto: [null]
    });
  }

  cargarCatalogos(): void {
    // Cargar aplicaciones
    this.catalogoService.listarAplicaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aplicaciones = response.data;
        }
      },
      error: (error) => console.error('Error al cargar aplicaciones:', error)
    });

    // Cargar estados
    this.catalogoService.listarEstados(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estados = response.data;
        }
      },
      error: (error) => console.error('Error al cargar estados:', error)
    });

    // Cargar prioridades
    this.catalogoService.listarPrioridades(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.prioridades = response.data;
        }
      },
      error: (error) => console.error('Error al cargar prioridades:', error)
    });

    // Cargar impactos
    this.catalogoService.listarImpactos(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.impactos = response.data;
        }
      },
      error: (error) => console.error('Error al cargar impactos:', error)
    });
  }

  onAplicacionChange(idAplicacion: number): void {
    // Limpiar módulo seleccionado solo si es un cambio manual
    if (!this.loadingTicket) {
      this.ticketForm.patchValue({ idModulo: null });
    }
    this.modulos = [];

    if (idAplicacion) {
      this.catalogoService.listarModulos(idAplicacion).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.modulos = response.data;
          }
        },
        error: (error) => console.error('Error al cargar módulos:', error)
      });
    }
  }

  abrirModal(ticketId: number): void {
    this.ticketId = ticketId;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.ticketForm.reset();
    
    // Cargar catálogos
    this.cargarCatalogos();
    
    // Cargar datos del ticket
    this.cargarTicket(ticketId);
  }

  cargarTicket(id: number): void {
    this.loadingTicket = true;
    
    this.ticketService.obtenerTicket(id).subscribe({
      next: (ticket) => {
        this.loadingTicket = false;
        this.ticketActual = ticket;
        
        // Llenar el formulario con los datos del ticket
        this.ticketForm.patchValue({
          codigo: ticket.sCodigo || '',
          descripcion: ticket.sDescripcion || '',
          idAplicacion: ticket.IdAplicacion || null,
          idModulo: ticket.IdModulo || null,
          idTipo: ticket.IdTipo || null,
          idEstado: ticket.IdEstado || null,
          idPrioridad: ticket.IdPrioridad || null,
          idImpacto: ticket.IdInpacto || null
        });

        // Cargar módulos si hay aplicación seleccionada
        if (ticket.IdAplicacion) {
          this.onAplicacionChange(ticket.IdAplicacion);
          // Después de cargar módulos, volver a setear el módulo seleccionado
          setTimeout(() => {
            this.ticketForm.patchValue({ idModulo: ticket.IdModulo || null });
          }, 800);
        }
      },
      error: (error) => {
        this.loadingTicket = false;
        this.errorMessage = 'Error al cargar el ticket';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ticketForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.ticketActual = null;
  }

  actualizarTicket(): void {
    if (this.ticketForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const ticketData: TicketUpdateRequest = {
      codigo: this.ticketForm.value.codigo,
      descripcion: this.ticketForm.value.descripcion,
      idAplicacion: this.ticketForm.value.idAplicacion || null,
      idModulo: this.ticketForm.value.idModulo || null,
      idTipo: this.ticketForm.value.idTipo || null,
      idEstado: this.ticketForm.value.idEstado || null,
      idPrioridad: this.ticketForm.value.idPrioridad || null,
      idImpacto: this.ticketForm.value.idImpacto || null
    };

    this.ticketService.actualizarTicket(this.ticketId, ticketData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Ticket actualizado exitosamente';
          setTimeout(() => {
            this.cerrarModal();
            this.ticketActualizado.emit();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al actualizar el ticket';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al actualizar el ticket';
        console.error('Error:', error);
      }
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.ticketForm.controls).forEach(key => {
      this.ticketForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.ticketForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.ticketForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}

