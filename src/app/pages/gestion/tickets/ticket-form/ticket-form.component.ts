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
    this.cargarCatalogos();
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

  cargarCatalogos(): void {
    // Cargar aplicaciones (ID = 9)
    this.comboService.getAplicaciones().subscribe({
      next: (data) => {
        this.aplicaciones = data;
        console.log('✅ Aplicaciones cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar aplicaciones:', error);
        this.errorMessage = 'Error al cargar aplicaciones';
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
        // El endpoint debe retornar módulos con estructura: { IdModulo, sDescripcion, Idaplicacion }
        this.modulosCompletos = data;
        console.log('✅ Módulos completos cargados con aplicaciones:', data.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos completos:', error);
      }
    });
  }

  onAplicacionChange(idAplicacion: number): void {
    // Limpiar módulo seleccionado solo si cambia manualmente
    const moduloActual = this.ticketForm.get('idModulo')?.value;
    this.modulos = [];

    if (idAplicacion) {
      // Cargar módulos filtrados por aplicación
      this.comboService.getModulosPorAplicacion(idAplicacion).subscribe({
        next: (data) => {
          this.modulos = data;
          console.log(`✅ Módulos cargados para aplicación ${idAplicacion}:`, data);
          
          // Si el módulo actual no pertenece a esta aplicación, limpiarlo
          if (moduloActual) {
            const moduloValido = data.find((m: ComboItem) => m.Id === moduloActual);
            if (!moduloValido) {
              this.ticketForm.patchValue({ idModulo: null }, { emitEvent: false });
            }
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar módulos:', error);
          this.errorMessage = 'Error al cargar módulos';
        }
      });
    }
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
      idAplicacion: this.ticketForm.value.idAplicacion || null,
      idModulo: this.ticketForm.value.idModulo || null,
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
