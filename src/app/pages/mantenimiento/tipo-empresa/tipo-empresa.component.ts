import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoEmpresaService } from '../../../core/services/tipoEmpresa.service';
import { TipoEmpresa } from '../../../core/models/tipoEmpresa.model';

@Component({
  selector: 'app-tipo-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipo-empresa.component.html',
  styleUrls: ['./tipo-empresa.component.scss']
})
export class TipoEmpresaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tipoEmpresaService = inject(TipoEmpresaService);

  tipoEmpresas: TipoEmpresa[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  tipoEmpresaForm!: FormGroup;
  tipoEmpresaIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTipoEmpresas();
  }

  inicializarFormulario(): void {
    this.tipoEmpresaForm = this.fb.group({
      Codigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarTipoEmpresas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.tipoEmpresaService.listarTipoEmpresas().subscribe({
      next: (tipoEmpresas) => {
        this.loading = false;
        this.tipoEmpresas = tipoEmpresas;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los tipos de empresa';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Tipo de Empresa';
    this.tipoEmpresaIdEdicion = null;
    this.tipoEmpresaForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(tipoEmpresa: TipoEmpresa): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Tipo de Empresa';
    this.tipoEmpresaIdEdicion = tipoEmpresa.IdTipo;
    this.tipoEmpresaForm.patchValue({
      Codigo: tipoEmpresa.sCodigo,
      sDescripcion: tipoEmpresa.sDescripcion
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoEmpresaForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.tipoEmpresaIdEdicion = null;
  }

  guardarTipoEmpresa(): void {
    if (this.tipoEmpresaForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const tipoEmpresaData = {
      Codigo: this.tipoEmpresaForm.value.Codigo,
      sDescripcion: this.tipoEmpresaForm.value.sDescripcion,
      User: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.tipoEmpresaIdEdicion !== null) {
      // Actualizar
      this.tipoEmpresaService.actualizarTipoEmpresa(this.tipoEmpresaIdEdicion, tipoEmpresaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Tipo de empresa actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarTipoEmpresas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el tipo de empresa';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el tipo de empresa';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.tipoEmpresaService.crearTipoEmpresa(tipoEmpresaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Tipo de empresa creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarTipoEmpresas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el tipo de empresa';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el tipo de empresa';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.tipoEmpresaForm.controls).forEach(key => {
      this.tipoEmpresaForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.tipoEmpresaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.tipoEmpresaForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }
}
