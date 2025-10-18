import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DetalleGeneralService } from '../../../core/services/detalle-general.service';
import { DetalleGeneral, TipoCabecera } from '../../../core/models/detalle-general.model';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.scss']
})
export class EstadoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private detalleService = inject(DetalleGeneralService);

  estados: DetalleGeneral[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  estadoForm!: FormGroup;
  estadoIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  // Constante para IdCabecera
  private readonly ID_CABECERA = TipoCabecera.ESTADO;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEstados();
  }

  inicializarFormulario(): void {
    this.estadoForm = this.fb.group({
      nCodIte: ['', [Validators.required, Validators.min(1)]],
      vTe1Gen: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarEstados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.detalleService.listarPorCabecera(this.ID_CABECERA).subscribe({
      next: (estados) => {
        this.loading = false;
        this.estados = estados;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los estados';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Estado';
    this.estadoIdEdicion = null;
    this.estadoForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(estado: DetalleGeneral): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Estado';
    this.estadoIdEdicion = estado.Id;
    this.estadoForm.patchValue({
      nCodIte: estado.nCodIte,
      vTe1Gen: estado.vTe1Gen
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.estadoForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.estadoIdEdicion = null;
  }

  guardarEstado(): void {
    if (this.estadoForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const estadoData = {
      IdCabecera: this.ID_CABECERA,
      nCodIte: this.estadoForm.value.nCodIte,
      vTe1Gen: this.estadoForm.value.vTe1Gen,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.estadoIdEdicion !== null) {
      // Actualizar
      this.detalleService.actualizarDetalle(this.estadoIdEdicion, estadoData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Estado actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarEstados();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el estado';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el estado';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.detalleService.crearDetalle(estadoData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Estado creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarEstados();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el estado';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el estado';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.estadoForm.controls).forEach(key => {
      this.estadoForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.estadoForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.estadoForm.get(campo);
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

  cambiarEstado(estado: DetalleGeneral): void {
    const nuevoEstado = estado.sEstado === 'A' ? 'I' : 'A';
    const accion = nuevoEstado === 'A' ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de ${accion} este estado?`)) {
      return;
    }

    this.detalleService.cambiarEstado(estado.Id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarEstados();
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
