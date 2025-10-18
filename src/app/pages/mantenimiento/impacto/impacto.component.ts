import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DetalleGeneralService } from '../../../core/services/detalle-general.service';
import { DetalleGeneral, DetalleGeneralCreateRequest, DetalleGeneralUpdateRequest, TipoCabecera } from '../../../core/models/detalle-general.model';

@Component({
  selector: 'app-impacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './impacto.component.html',
  styleUrls: ['./impacto.component.scss']
})
export class ImpactoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private detalleService = inject(DetalleGeneralService);

  impactos: DetalleGeneral[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  impactoForm!: FormGroup;
  impactoIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  // Constante para IdCabecera
  private readonly ID_CABECERA = TipoCabecera.IMPACTO;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarImpactos();
  }

  inicializarFormulario(): void {
    this.impactoForm = this.fb.group({
      nCodIte: ['', [Validators.required, Validators.min(1)]],
      vTe1Gen: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarImpactos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.detalleService.listarPorCabecera(this.ID_CABECERA).subscribe({
      next: (impactos) => {
        this.loading = false;
        this.impactos = impactos;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los niveles de urgencia/impacto';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Nivel de Urgencia';
    this.impactoIdEdicion = null;
    this.impactoForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(impacto: DetalleGeneral): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Nivel de Urgencia';
    this.impactoIdEdicion = impacto.Id;
    this.impactoForm.patchValue({
      nCodIte: impacto.nCodIte,
      vTe1Gen: impacto.vTe1Gen
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.impactoForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.impactoIdEdicion = null;
  }

  guardarImpacto(): void {
    if (this.impactoForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const impactoData = {
      IdCabecera: this.ID_CABECERA,
      nCodIte: this.impactoForm.value.nCodIte,
      vTe1Gen: this.impactoForm.value.vTe1Gen,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.impactoIdEdicion !== null) {
      // Actualizar
      this.detalleService.actualizarDetalle(this.impactoIdEdicion, impactoData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Nivel de urgencia actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarImpactos();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el nivel de urgencia';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el nivel de urgencia';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.detalleService.crearDetalle(impactoData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Nivel de urgencia creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarImpactos();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el nivel de urgencia';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el nivel de urgencia';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.impactoForm.controls).forEach(key => {
      this.impactoForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.impactoForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.impactoForm.get(campo);
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

  cambiarEstado(impacto: DetalleGeneral): void {
    const nuevoEstado = impacto.sEstado === 'A' ? 'I' : 'A';
    const accion = nuevoEstado === 'A' ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de ${accion} este nivel de urgencia?`)) {
      return;
    }

    this.detalleService.cambiarEstado(impacto.Id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || `Nivel de urgencia ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} exitosamente`;
          this.cargarImpactos();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
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
