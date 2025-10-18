import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DetalleGeneralService } from '../../../core/services/detalle-general.service';
import { DetalleGeneral, TipoCabecera } from '../../../core/models/detalle-general.model';

@Component({
  selector: 'app-prioridad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prioridad.component.html',
  styleUrls: ['./prioridad.component.scss']
})
export class PrioridadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private detalleService = inject(DetalleGeneralService);

  prioridades: DetalleGeneral[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  prioridadForm!: FormGroup;
  prioridadIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  // Constante para IdCabecera
  private readonly ID_CABECERA = TipoCabecera.PRIORIDAD;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPrioridades();
  }

  inicializarFormulario(): void {
    this.prioridadForm = this.fb.group({
      nCodIte: ['', [Validators.required, Validators.min(1)]],
      vTe1Gen: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarPrioridades(): void {
    this.loading = true;
    this.errorMessage = '';

    this.detalleService.listarPorCabecera(this.ID_CABECERA).subscribe({
      next: (prioridades) => {
        this.loading = false;
        this.prioridades = prioridades;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las prioridades';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Prioridad';
    this.prioridadIdEdicion = null;
    this.prioridadForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(prioridad: DetalleGeneral): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Prioridad';
    this.prioridadIdEdicion = prioridad.Id;
    this.prioridadForm.patchValue({
      nCodIte: prioridad.nCodIte,
      vTe1Gen: prioridad.vTe1Gen
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.prioridadForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.prioridadIdEdicion = null;
  }

  guardarPrioridad(): void {
    if (this.prioridadForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const prioridadData = {
      IdCabecera: this.ID_CABECERA,
      nCodIte: this.prioridadForm.value.nCodIte,
      vTe1Gen: this.prioridadForm.value.vTe1Gen,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.prioridadIdEdicion !== null) {
      // Actualizar
      this.detalleService.actualizarDetalle(this.prioridadIdEdicion, prioridadData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Prioridad actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPrioridades();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la prioridad';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la prioridad';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.detalleService.crearDetalle(prioridadData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Prioridad creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPrioridades();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear la prioridad';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la prioridad';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.prioridadForm.controls).forEach(key => {
      this.prioridadForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.prioridadForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.prioridadForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El código debe ser mayor a 0';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }

  obtenerEstadoTexto(estado?: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  cambiarEstado(prioridad: DetalleGeneral): void {
    const nuevoEstado = prioridad.sEstado === 'A' ? 'I' : 'A';
    const accion = nuevoEstado === 'A' ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de ${accion} esta prioridad?`)) {
      return;
    }

    this.detalleService.cambiarEstado(prioridad.Id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarPrioridades();
        } else {
          this.errorMessage = response.message || 'Error al cambiar el estado';
        }
      },
      error: (error) => {
        const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al cambiar el estado';
        this.errorMessage = errorMsg;
        console.error('Error:', error);
      }
    });
  }
}
