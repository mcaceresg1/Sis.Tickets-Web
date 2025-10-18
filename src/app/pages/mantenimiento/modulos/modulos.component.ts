import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModuloService } from '../../../core/services/modulo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Modulo, ModuloList } from '../../../core/models/modulo.model';

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
  private authService = inject(AuthService);

  modulos: ModuloList[] = [];
  loading = false;
  errorMessage = '';
  idEmpresaUsuario: number = 1; // Se inicializará con el idEmpresa del usuario logueado

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  moduloForm!: FormGroup;
  moduloIdEdicion: number | null = null;

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
    this.cargarModulos();
  }

  inicializarFormulario(): void {
    this.moduloForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]],
      Idaplicacion: [null, [Validators.required]]
    });
  }

  cargarModulos(): void {
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
        this.errorMessage = 'Error al cargar los módulos';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Módulo';
    this.moduloIdEdicion = null;
    this.moduloForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(modulo: ModuloList): void {
    // Obtener los datos completos del módulo
    this.moduloService.obtenerModulo(modulo.IdModulo).subscribe({
      next: (moduloCompleto) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Módulo';
        this.moduloIdEdicion = modulo.IdModulo;
        this.moduloForm.patchValue({
          sCodigo: moduloCompleto.sCodigo,
          sDescripcion: moduloCompleto.sDescripcion,
          Idaplicacion: moduloCompleto.Idaplicacion
        });
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos del módulo';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.moduloForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.moduloIdEdicion = null;
  }

  guardarModulo(): void {
    if (this.moduloForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const moduloData = {
      sCodigo: this.moduloForm.value.sCodigo,
      sDescripcion: this.moduloForm.value.sDescripcion,
      Idaplicacion: this.moduloForm.value.Idaplicacion,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.moduloIdEdicion !== null) {
      // Actualizar
      this.moduloService.actualizarModulo(this.moduloIdEdicion, moduloData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Módulo actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarModulos();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el módulo';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el módulo';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.moduloService.crearModulo(moduloData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Módulo creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarModulos();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el módulo';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el módulo';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.moduloForm.controls).forEach(key => {
      this.moduloForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.moduloForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.moduloForm.get(campo);
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
