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
  sistemas: ComboItem[] = [];       // ✅ Nivel 1: Sistemas
  modulos: ComboItem[] = [];        // ✅ Nivel 2: Módulos (filtrados por sistema)
  paginas: ComboItem[] = [];        // ✅ Nivel 3: Páginas (filtradas por módulo)
  tiposIncidencia: ComboItem[] = [];
  estados: ComboItem[] = [];
  prioridades: ComboItem[] = [];
  impactos: ComboItem[] = [];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarFiltradoCascada();  // ✅ Configurar filtrado Sistema→Módulo→Página
  }

  inicializarFormulario(): void {
    this.ticketForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      descripcion: ['', [Validators.required]],
      idSistema: [null, [Validators.required]],   // ✅ Nivel 1: Sistema
      idModulo: [null, [Validators.required]],    // ✅ Nivel 2: Módulo
      idPagina: [null, [Validators.required]],    // ✅ Nivel 3: Página
      idTipo: [null],
      idEstado: [null],
      idPrioridad: [null],
      idImpacto: [null]
    });
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
      sistemas: this.comboService.getSistemas(),
      tiposIncidencia: this.comboService.getTiposIncidencia(),
      estados: this.comboService.getEstados(),
      prioridades: this.comboService.getPrioridades(),
      impactos: this.comboService.getNivelesUrgencia()
    }).subscribe({
      next: (resultado) => {
        // Guardar los datos de los combos
        this.sistemas = resultado.sistemas;
        this.tiposIncidencia = resultado.tiposIncidencia;
        this.estados = resultado.estados;
        this.prioridades = resultado.prioridades;
        this.impactos = resultado.impactos;
        this.ticketActual = resultado.ticket;

        console.log('📝 Ticket cargado para edición:', resultado.ticket);
        console.log('📋 Catálogos cargados');

        // Primero cargar módulos del sistema
        if (resultado.ticket.IdSistema) {
          this.comboService.getModulosPorSistema(resultado.ticket.IdSistema).subscribe({
            next: (modulos) => {
              this.modulos = modulos;
              console.log(`✅ Módulos cargados para sistema ${resultado.ticket.IdSistema}:`, modulos);

              // Luego cargar páginas del módulo
              if (resultado.ticket.IdModulo) {
                this.comboService.getPaginasPorModulo(resultado.ticket.IdModulo).subscribe({
                  next: (paginas) => {
                    this.paginas = paginas;
                    console.log(`✅ Páginas cargadas para módulo ${resultado.ticket.IdModulo}:`, paginas);

                    // Finalmente llenar el formulario
                    this.ticketForm.patchValue({
                      codigo: resultado.ticket.sCodigo || '',
                      descripcion: resultado.ticket.sDescripcion || '',
                      idSistema: resultado.ticket.IdSistema || null,
                      idModulo: resultado.ticket.IdModulo || null,
                      idPagina: resultado.ticket.IdPagina || null,
                      idTipo: resultado.ticket.IdTipo || null,
                      idEstado: resultado.ticket.IdEstado || null,
                      idPrioridad: resultado.ticket.IdPrioridad || null,
                      idImpacto: resultado.ticket.IdInpacto || null
                    });

                    console.log('✅ Formulario pre-llenado con valores:', this.ticketForm.value);
                    this.loadingTicket = false;
                  },
                  error: (error) => {
                    console.error('❌ Error al cargar páginas:', error);
                    this.loadingTicket = false;
                  }
                });
              } else {
                this.loadingTicket = false;
              }
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
      idSistema: this.ticketForm.value.idSistema || null,   // ✅ NUEVO: Sistema
      idModulo: this.ticketForm.value.idModulo || null,     // ✅ Módulo
      idPagina: this.ticketForm.value.idPagina || null,     // ✅ Página
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
   * ✅ Configurar filtrado en cascada: Sistema → Módulo → Página
   */
  private configurarFiltradoCascada(): void {
    // Cuando cambia el Sistema, cargar Módulos
    this.ticketForm.get('idSistema')?.valueChanges.subscribe((idSistema: number | null) => {
      if (!this.loadingTicket) {  // Solo si no estamos cargando el ticket
        console.log('🔄 Sistema cambió a:', idSistema);
        this.modulos = [];
        this.paginas = [];
        this.ticketForm.patchValue({ idModulo: null, idPagina: null }, { emitEvent: false });

        if (idSistema) {
          this.comboService.getModulosPorSistema(idSistema).subscribe({
            next: (data) => {
              this.modulos = data;
              console.log(`✅ Módulos cargados para sistema ${idSistema}:`, data);
            },
            error: (error) => {
              console.error('❌ Error al cargar módulos:', error);
              this.errorMessage = 'Error al cargar módulos';
            }
          });
        }
      }
    });

    // Cuando cambia el Módulo, cargar Páginas
    this.ticketForm.get('idModulo')?.valueChanges.subscribe((idModulo: number | null) => {
      if (!this.loadingTicket) {  // Solo si no estamos cargando el ticket
        console.log('🔄 Módulo cambió a:', idModulo);
        this.paginas = [];
        this.ticketForm.patchValue({ idPagina: null }, { emitEvent: false });

        if (idModulo) {
          this.comboService.getPaginasPorModulo(idModulo).subscribe({
            next: (data) => {
              this.paginas = data;
              console.log(`✅ Páginas cargadas para módulo ${idModulo}:`, data);
            },
            error: (error) => {
              console.error('❌ Error al cargar páginas:', error);
              this.errorMessage = 'Error al cargar páginas';
            }
          });
        }
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

