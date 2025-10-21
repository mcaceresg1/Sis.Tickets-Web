import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModuloService } from '../../../core/services/modulo.service';
import { ComboService } from '../../../core/services/combo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Modulo, ModuloList } from '../../../core/models/modulo.model';
import { ComboItem } from '../../../core/models/combo.model';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.scss']
})
export class ModulosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private moduloService = inject(ModuloService);
  private comboService = inject(ComboService);
  private authService = inject(AuthService);

  modulos: ModuloList[] = [];
  sistemas: ComboItem[] = [];
  loading = false;
  errorMessage = '';
  idEmpresaUsuario: number = 1; // Se inicializará con el idEmpresa del usuario logueado

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  ModuloForm!: FormGroup;
  ModuloIdEdicion: number | null = null;

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
    this.cargarSistemas();
    this.cargarmodulos();
  }

  inicializarFormulario(): void {
    this.ModuloForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]],
      IdSistema: [1, [Validators.required]]
    });
  }

  cargarSistemas(): void {
    this.comboService.getSistemas().subscribe({
      next: (data) => {
        this.sistemas = data;
        console.log('✅ Sistemas cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar sistemas:', error);
      }
    });
  }

  cargarmodulos(): void {
    this.loading = true;
    this.errorMessage = '';

    // Enviar idEmpresa del usuario logueado
    this.moduloService.listarModulos(this.idEmpresaUsuario).subscribe({
      next: (modulos) => {
        this.loading = false;
        this.modulos = modulos;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las modulos';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Aplicación';
    this.ModuloIdEdicion = null;
    this.ModuloForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(Modulo: ModuloList): void {
    // Obtener los datos completos de la aplicación
    this.moduloService.obtenerModulo(Modulo.IdModulo).subscribe({
      next: (ModuloCompleta) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Aplicación';
        this.ModuloIdEdicion = Modulo.IdModulo;
        this.ModuloForm.patchValue({
          sCodigo: ModuloCompleta.sCodigo,
          sDescripcion: ModuloCompleta.sDescripcion,
          IdSistema: ModuloCompleta.IdSistema || 1
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
    this.ModuloForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.ModuloIdEdicion = null;
  }

  guardarModulo(): void {
    if (this.ModuloForm.invalid) {
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

    const ModuloData = {
      sCodigo: this.ModuloForm.value.sCodigo,
      sDescripcion: this.ModuloForm.value.sDescripcion,
      IdSistema: this.ModuloForm.value.IdSistema,
      Usuario: usuario // Necesario para obtener IdEmpresa en el SP
    };

    if (this.modoEdicion && this.ModuloIdEdicion !== null) {
      // Actualizar
      this.moduloService.actualizarModulo(this.ModuloIdEdicion, ModuloData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Aplicación actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarmodulos();
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
      this.moduloService.crearModulo(ModuloData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Aplicación creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarmodulos();
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
    Object.keys(this.ModuloForm.controls).forEach(key => {
      this.ModuloForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.ModuloForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.ModuloForm.get(campo);
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
