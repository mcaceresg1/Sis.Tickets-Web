import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { ComboService } from '../../../../core/services/combo.service';
import { ComboItem, ComboType } from '../../../../core/models/combo.model';
import { TicketCreateRequest } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private comboService = inject(ComboService);

  @Output() ticketCreado = new EventEmitter<void>();

  ticketForm!: FormGroup;
  mostrarModal = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

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
    this.cargarCatalogos();
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

  cargarCatalogos(): void {
    // Cargar Sistemas filtrados por usuario
    // Si es ADMIN: ve todos los sistemas
    // Si NO es admin: ve solo su sistema (IdSistema)
    this.comboService.getSistemasDelUsuario().subscribe({
      next: (data) => {
        this.sistemas = data;
        console.log('✅ Sistemas cargados (filtrados por usuario):', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar sistemas:', error);
        // Fallback: intentar cargar todos los sistemas
        this.comboService.getComboById(20).subscribe({
          next: (data) => {
            this.sistemas = data;
            console.log('⚠️ Sistemas cargados sin filtro (fallback):', data);
          },
          error: (err) => {
            console.error('❌ Error en fallback:', err);
            this.errorMessage = 'Error al cargar sistemas';
          }
        });
      }
    });

    // Cargar estados (ID = 4)
    this.comboService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
        console.log('✅ Estados cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar estados:', error);
        this.errorMessage = 'Error al cargar estados';
      }
    });

    // Cargar prioridades (ID = 3)
    this.comboService.getPrioridades().subscribe({
      next: (data) => {
        this.prioridades = data;
        console.log('✅ Prioridades cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar prioridades:', error);
        this.errorMessage = 'Error al cargar prioridades';
      }
    });

    // Cargar impactos (ID = 5)
    this.comboService.getNivelesUrgencia().subscribe({
      next: (data) => {
        this.impactos = data;
        console.log('✅ Impactos cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar impactos:', error);
        this.errorMessage = 'Error al cargar impactos';
      }
    });

    // Cargar tipos de incidencia (ID = 12)
    this.comboService.getTiposIncidencia().subscribe({
      next: (data) => {
        this.tiposIncidencia = data;
        console.log('✅ Tipos de Incidencia cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar tipos de incidencia:', error);
        this.errorMessage = 'Error al cargar tipos de incidencia';
      }
    });
  }

  /**
   * ✅ Configurar filtrado en cascada: Sistema → Módulo → Página
   */
  private configurarFiltradoCascada(): void {
    // Cuando cambia el Sistema, cargar Módulos
    this.ticketForm.get('idSistema')?.valueChanges.subscribe((idSistema: number | null) => {
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
    });

    // Cuando cambia el Módulo, cargar Páginas
    this.ticketForm.get('idModulo')?.valueChanges.subscribe((idModulo: number | null) => {
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
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.ticketForm.reset();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ticketForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  guardarTicket(): void {
    if (this.ticketForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const ticketData: TicketCreateRequest = {
      codigo: this.ticketForm.value.codigo,
      descripcion: this.ticketForm.value.descripcion,
      idSistema: this.ticketForm.value.idSistema,        // ✅ NUEVO: Sistema
      idModulo: this.ticketForm.value.idModulo,          // ✅ Módulo
      idPagina: this.ticketForm.value.idPagina || null,  // ✅ Página
      idTipo: this.ticketForm.value.idTipo || null,
      idEstado: this.ticketForm.value.idEstado || null,
      idPrioridad: this.ticketForm.value.idPrioridad || null,
      idImpacto: this.ticketForm.value.idImpacto || null
    };

    this.ticketService.crearTicket(ticketData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Ticket creado exitosamente';
          setTimeout(() => {
            this.cerrarModal();
            this.ticketCreado.emit();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al crear el ticket';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al crear el ticket';
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
