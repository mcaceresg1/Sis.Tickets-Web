import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilService } from '../../../core/services/perfil.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil, PerfilList } from '../../../core/models/perfil.model';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.scss']
})
export class PerfilesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);

  perfiles: PerfilList[] = [];
  loading = false;
  errorMessage = '';
  
  // Info del usuario logueado
  idEmpresaUsuario: number = 1;
  idPerfilUsuario: number = 1; // 1 = ADMINISTRADOR ve todos
  esAdministrador = false;

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  perfilForm!: FormGroup;
  perfilIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    // Obtener info del usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.idEmpresaUsuario = currentUser.idEmpresa || 1;
      this.idPerfilUsuario = currentUser.idPerfil || 1;
      this.esAdministrador = this.idPerfilUsuario === 1;
    }

    this.inicializarFormulario();
    this.cargarPerfiles();
  }

  inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  cargarPerfiles(): void {
    this.loading = true;
    this.errorMessage = '';

    // Enviar idEmpresa e idPerfil del usuario logueado
    this.perfilService.listarPerfiles(this.idEmpresaUsuario, this.idPerfilUsuario).subscribe({
      next: (perfiles) => {
        this.loading = false;
        this.perfiles = perfiles;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los perfiles';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Perfil';
    this.perfilIdEdicion = null;
    this.perfilForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(perfil: PerfilList): void {
    // Obtener los datos completos del perfil
    this.perfilService.obtenerPerfil(perfil.IdPerfil).subscribe({
      next: (perfilCompleto) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Perfil';
        this.perfilIdEdicion = perfil.IdPerfil;
        this.perfilForm.patchValue({
          Nombre: perfilCompleto.Perfil
        });
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos del perfil';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.perfilForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.perfilIdEdicion = null;
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    // Obtener el usuario del login
    const currentUser = this.authService.getCurrentUser();
    const usuario = currentUser?.nombre?.toLowerCase() || 'admin';

    const perfilData = {
      IdEmpresa: this.idEmpresaUsuario,
      Nombre: this.perfilForm.value.Nombre,
      Usuario: usuario
    };

    if (this.modoEdicion && this.perfilIdEdicion !== null) {
      // Actualizar
      this.perfilService.actualizarPerfil(this.perfilIdEdicion, perfilData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Perfil actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPerfiles();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el perfil';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el perfil';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.perfilService.crearPerfil(perfilData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Perfil creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPerfiles();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el perfil';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el perfil';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.perfilForm.controls).forEach(key => {
      this.perfilForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.perfilForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.perfilForm.get(campo);
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
