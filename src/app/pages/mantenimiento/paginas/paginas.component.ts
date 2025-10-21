import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginaService } from '../../../core/services/pagina.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pagina, PaginaList } from '../../../core/models/pagina.model';

@Component({
  selector: 'app-paginas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paginas.component.html',
  styleUrls: ['./paginas.component.scss']
})
export class PaginasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paginaService = inject(PaginaService);
  private authService = inject(AuthService);

  paginas: PaginaList[] = [];
  loading = false;
  errorMessage = '';
  idEmpresaUsuario: number = 1; // Se inicializará con el idEmpresa del usuario logueado

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  paginaForm!: FormGroup;
  paginaIdEdicion: number | null = null;

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
    this.cargarPaginas();
  }

  inicializarFormulario(): void {
    this.paginaForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(100)]],
      IdModulo: [null, [Validators.required]]
    });
  }

  cargarPaginas(): void {
    this.loading = true;
    this.errorMessage = '';

    // Enviar idEmpresa del usuario logueado
    this.paginaService.listarPaginas(this.idEmpresaUsuario).subscribe({
      next: (paginas) => {
        this.loading = false;
        this.paginas = paginas;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las páginas';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Página';
    this.paginaIdEdicion = null;
    this.paginaForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(pagina: PaginaList): void {
    // Obtener los datos completos de la página
    this.paginaService.obtenerPagina(pagina.IdPagina).subscribe({
      next: (paginaCompleta) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Página';
        this.paginaIdEdicion = pagina.IdPagina;
        this.paginaForm.patchValue({
          sCodigo: paginaCompleta.sCodigo,
          sDescripcion: paginaCompleta.sDescripcion,
          IdModulo: paginaCompleta.IdModulo
        });
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de la página';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.paginaForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.paginaIdEdicion = null;
  }

  guardarPagina(): void {
    if (this.paginaForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const paginaData = {
      sCodigo: this.paginaForm.value.sCodigo,
      sDescripcion: this.paginaForm.value.sDescripcion,
      IdModulo: this.paginaForm.value.IdModulo,
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.paginaIdEdicion !== null) {
      // Actualizar
      this.paginaService.actualizarPagina(this.paginaIdEdicion, paginaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Página actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPaginas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la página';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la página';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.paginaService.crearPagina(paginaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Página creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarPaginas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear la página';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la página';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.paginaForm.controls).forEach(key => {
      this.paginaForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.paginaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.paginaForm.get(campo);
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
