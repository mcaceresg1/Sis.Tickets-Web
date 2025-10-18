import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaisService } from '../../../core/services/pais.service';
import { Pais, PaisCreateRequest, PaisUpdateRequest } from '../../../core/models/pais.model';

@Component({
  selector: 'app-pais',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pais.component.html',
  styleUrls: ['./pais.component.scss']
})
export class PaisComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paisService = inject(PaisService);

  paises: Pais[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  paisForm!: FormGroup;
  paisIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPaises();
  }

  inicializarFormulario(): void {
    this.paisForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDesc: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  cargarPaises(): void {
    this.loading = true;
    this.errorMessage = '';

    this.paisService.listarPaises().subscribe({
      next: (paises) => {
        this.loading = false;
        this.paises = paises;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los países';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo País';
    this.paisIdEdicion = null;
    this.paisForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(pais: Pais): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar País';
    this.paisIdEdicion = pais.IdPais;
    this.paisForm.patchValue({
      sCodigo: pais.sCodigo,
      sDesc: pais.sDesc
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.paisForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.paisIdEdicion = null;
  }

  guardarPais(): void {
    if (this.paisForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const paisData = {
      sCodigo: this.paisForm.value.sCodigo,
      sDesc: this.paisForm.value.sDesc,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.paisIdEdicion !== null) {
      // Actualizar
      this.paisService.actualizarPais(this.paisIdEdicion, paisData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'País actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPaises();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el país';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el país';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.paisService.crearPais(paisData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'País creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPaises();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el país';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el país';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.paisForm.controls).forEach(key => {
      this.paisForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.paisForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.paisForm.get(campo);
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
