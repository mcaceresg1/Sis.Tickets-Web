import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AplicacionService } from '../../../core/services/aplicacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Aplicacion, AplicacionList } from '../../../core/models/aplicacion.model';

@Component({
  selector: 'app-aplicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aplicaciones.component.html',
  styleUrls: ['./aplicaciones.component.scss']
})
export class AplicacionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private aplicacionService = inject(AplicacionService);
  private authService = inject(AuthService);

  aplicaciones: AplicacionList[] = [];
  loading = false;
  errorMessage = '';
  idEmpresaUsuario: number = 1; // Se inicializará con el idEmpresa del usuario logueado

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  aplicacionForm!: FormGroup;
  aplicacionIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    // Obtener idEmpresa del usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.idEmpresa) {
      this.idEmpresaUsuario = currentUser.idEmpresa;
    }

    this.inicializarFormulario();
    this.cargarAplicaciones();
  }

  inicializarFormulario(): void {
    this.aplicacionForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarAplicaciones(): void {
    this.loading = true;
    this.errorMessage = '';

    // Enviar idEmpresa del usuario logueado
    this.aplicacionService.listarAplicaciones(this.idEmpresaUsuario).subscribe({
      next: (aplicaciones) => {
        this.loading = false;
        this.aplicaciones = aplicaciones;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las aplicaciones';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Aplicación';
    this.aplicacionIdEdicion = null;
    this.aplicacionForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(aplicacion: AplicacionList): void {
    // Obtener los datos completos de la aplicación
    this.aplicacionService.obtenerAplicacion(aplicacion.IdApli).subscribe({
      next: (aplicacionCompleta) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Aplicación';
        this.aplicacionIdEdicion = aplicacion.IdApli;
        this.aplicacionForm.patchValue({
          sCodigo: aplicacionCompleta.sCodigo,
          sDescripcion: aplicacionCompleta.sDescripcion
        });
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de la aplicación';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.aplicacionForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.aplicacionIdEdicion = null;
  }

  guardarAplicacion(): void {
    if (this.aplicacionForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    // Obtener el usuario del login para enviarlo al backend
    const currentUser = this.authService.getCurrentUser();
    const usuario = currentUser?.nombre?.toLowerCase() || 'admin';

    const aplicacionData = {
      sCodigo: this.aplicacionForm.value.sCodigo,
      sDescripcion: this.aplicacionForm.value.sDescripcion,
      Usuario: usuario // Necesario para obtener IdEmpresa en el SP
    };

    if (this.modoEdicion && this.aplicacionIdEdicion !== null) {
      // Actualizar
      this.aplicacionService.actualizarAplicacion(this.aplicacionIdEdicion, aplicacionData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Aplicación actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarAplicaciones();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la aplicación';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la aplicación';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.aplicacionService.crearAplicacion(aplicacionData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Aplicación creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarAplicaciones();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear la aplicación';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la aplicación';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.aplicacionForm.controls).forEach(key => {
      this.aplicacionForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.aplicacionForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.aplicacionForm.get(campo);
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
