import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SistemaService } from '../../../core/services/sistema.service';
import { Sistema, SistemaList } from '../../../core/models/sistema.model';

@Component({
  selector: 'app-sistemas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sistemas.component.html',
  styleUrls: ['./sistemas.component.scss']
})
export class SistemasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sistemaService = inject(SistemaService);

  sistemas: SistemaList[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  sistemaForm!: FormGroup;
  sistemaIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarSistemas();
  }

  inicializarFormulario(): void {
    this.sistemaForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarSistemas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.sistemaService.listarSistemas().subscribe({
      next: (sistemas) => {
        this.loading = false;
        this.sistemas = sistemas;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los sistemas';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Sistema';
    this.sistemaIdEdicion = null;
    this.sistemaForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(sistema: SistemaList): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Sistema';
    this.sistemaIdEdicion = sistema.IdSistema;
    this.sistemaForm.patchValue({
      sCodigo: sistema.sCodigo,
      sDescripcion: sistema.sDescripcion
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.sistemaForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.sistemaIdEdicion = null;
  }

  guardarSistema(): void {
    if (this.sistemaForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const sistemaData = {
      sCodigo: this.sistemaForm.value.sCodigo,
      sDescripcion: this.sistemaForm.value.sDescripcion,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.sistemaIdEdicion !== null) {
      // Actualizar
      this.sistemaService.actualizarSistema(this.sistemaIdEdicion, sistemaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Sistema actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarSistemas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el sistema';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el sistema';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.sistemaService.crearSistema(sistemaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Sistema creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarSistemas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el sistema';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el sistema';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.sistemaForm.controls).forEach(key => {
      this.sistemaForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.sistemaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.sistemaForm.get(campo);
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

