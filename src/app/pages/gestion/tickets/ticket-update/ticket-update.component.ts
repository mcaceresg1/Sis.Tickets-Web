import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../../../core/services/ticket.service';
import { ComboService } from '../../../../core/services/combo.service';
import { ComboItem } from '../../../../core/models/combo.model';
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
  private comboService = inject(ComboService);

  @Output() ticketActualizado = new EventEmitter<void>();

  ticketForm!: FormGroup;
  mostrarModal = false;
  loading = false;
  loadingTicket = false;
  errorMessage = '';
  successMessage = '';

  ticketId: number = 0;
  ticketActual: TicketDetail | null = null;

  // Combos
  aplicaciones: ComboItem[] = [];
  modulos: ComboItem[] = [];
  modulosCompletos: any[] = [];  // ✅ NUEVO: TODOS los módulos con IdAplicacion
  tiposIncidencia: ComboItem[] = [];
  estados: ComboItem[] = [];
  prioridades: ComboItem[] = [];
  impactos: ComboItem[] = [];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarAutoSeleccionAplicacion();  // ✅ NUEVO
    this.cargarTodosModulosConAplicacion();    // ✅ NUEVO
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

  onAplicacionChange(idAplicacion: number): void {
    // Limpiar módulo seleccionado solo si es un cambio manual
    if (!this.loadingTicket) {
      this.ticketForm.patchValue({ idModulo: null });
    }
    this.modulos = [];

    if (idAplicacion) {
      // Cargar módulos filtrados por aplicación
      this.comboService.getModulosPorAplicacion(idAplicacion).subscribe({
        next: (data) => {
          this.modulos = data;
          console.log(`✅ Módulos cargados para aplicación ${idAplicacion} (edición):`, data);
          
          // Si estamos cargando el ticket, re-setear el módulo después de cargar la lista
          if (this.loadingTicket && this.ticketActual?.IdModulo) {
            setTimeout(() => {
              this.ticketForm.patchValue({ idModulo: this.ticketActual?.IdModulo });
            }, 100);
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar módulos:', error);
          this.errorMessage = 'Error al cargar módulos';
        }
      });
    }
  }

  abrirModal(ticketId: number): void {
    this.ticketId = ticketId;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.ticketForm.reset();
    this.loadingTicket = true;
    
    // Cargar ticket y catálogos en paralelo
    forkJoin({
      ticket: this.ticketService.obtenerTicket(ticketId),
      aplicaciones: this.comboService.getAplicaciones(),
      tiposIncidencia: this.comboService.getTiposIncidencia(),
      estados: this.comboService.getEstados(),
      prioridades: this.comboService.getPrioridades(),
      impactos: this.comboService.getNivelesUrgencia()
    }).subscribe({
      next: (resultado) => {
        // Guardar los datos de los combos
        this.aplicaciones = resultado.aplicaciones;
        this.tiposIncidencia = resultado.tiposIncidencia;
        this.estados = resultado.estados;
        this.prioridades = resultado.prioridades;
        this.impactos = resultado.impactos;
        this.ticketActual = resultado.ticket;

        console.log('📝 Ticket cargado para edición:', resultado.ticket);
        console.log('📋 Catálogos cargados');

        // Llenar el formulario con los datos del ticket
        this.ticketForm.patchValue({
          codigo: resultado.ticket.sCodigo || '',
          descripcion: resultado.ticket.sDescripcion || '',
          idAplicacion: resultado.ticket.IdAplicacion || null,
          idTipo: resultado.ticket.IdTipo || null,
          idEstado: resultado.ticket.IdEstado || null,
          idPrioridad: resultado.ticket.IdPrioridad || null,
          idImpacto: resultado.ticket.IdInpacto || null
        });

        console.log('✅ Formulario pre-llenado con valores:', this.ticketForm.value);

        // Cargar módulos si hay aplicación seleccionada
        if (resultado.ticket.IdAplicacion) {
          this.comboService.getModulosPorAplicacion(resultado.ticket.IdAplicacion).subscribe({
            next: (modulos) => {
              this.modulos = modulos;
              console.log(`✅ Módulos cargados para aplicación ${resultado.ticket.IdAplicacion}:`, modulos);
              
              // Setear el módulo del ticket
              this.ticketForm.patchValue({ idModulo: resultado.ticket.IdModulo || null });
              console.log(`✅ Módulo seleccionado: ${resultado.ticket.IdModulo}`);
              
              this.loadingTicket = false;
            },
            error: (error) => {
              console.error('❌ Error al cargar módulos:', error);
              this.loadingTicket = false;
            }
          });
        } else {
          this.loadingTicket = false;
        }
      },
      error: (error) => {
        this.loadingTicket = false;
        this.errorMessage = 'Error al cargar los datos del ticket';
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

  /**
   * ✅ NUEVO: Configurar auto-selección de aplicación al seleccionar módulo
   */
  private configurarAutoSeleccionAplicacion(): void {
    this.ticketForm.get('idModulo')?.valueChanges.subscribe((idModulo: number) => {
      if (idModulo && this.modulosCompletos.length > 0) {
        const modulo = this.modulosCompletos.find(m => m.IdModulo === idModulo);
        if (modulo && modulo.Idaplicacion) {
          const idAplicacionActual = this.ticketForm.get('idAplicacion')?.value;
          
          // Solo cambiar si es diferente para evitar loops
          if (idAplicacionActual !== modulo.Idaplicacion) {
            this.ticketForm.patchValue({ idAplicacion: modulo.Idaplicacion }, { emitEvent: false });
            console.log(`🎯 Aplicación auto-seleccionada: ${modulo.Idaplicacion} para módulo ${idModulo}`);
            
            // Recargar módulos de la aplicación seleccionada
            this.onAplicacionChange(modulo.Idaplicacion);
          }
        }
      }
    });
  }

  /**
   * ✅ NUEVO: Cargar todos los módulos con su IdAplicacion
   */
  private cargarTodosModulosConAplicacion(): void {
    this.comboService.getAllModulos().subscribe({
      next: (data: any) => {
        // Guardar módulos completos con IdAplicacion
        this.modulosCompletos = data;
        console.log('✅ Módulos completos cargados con aplicaciones:', data.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos completos:', error);
      }
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

