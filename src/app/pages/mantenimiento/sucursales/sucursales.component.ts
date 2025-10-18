import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SucursalService } from '../../../core/services/sucursal.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sucursal, SucursalList } from '../../../core/models/sucursal.model';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.scss']
})
export class SucursalesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);
  private catalogoService = inject(CatalogoService);
  private authService = inject(AuthService);

  sucursales: SucursalList[] = [];
  loading = false;
  errorMessage = '';

  // Catálogos
  empresas: any[] = [];
  paises: any[] = [];
  tiposEmpresa: any[] = [];
  idEmpresaSeleccionada: number = 1; // Se inicializará con el idEmpresa del usuario logueado

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  sucursalForm!: FormGroup;
  sucursalIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    // Obtener idEmpresa del usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.idEmpresa) {
      this.idEmpresaSeleccionada = currentUser.idEmpresa;
    }
    
    this.inicializarFormulario();
    this.cargarCatalogos();
    this.cargarSucursales();
  }

  inicializarFormulario(): void {
    this.sucursalForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(10)]],
      IdEmpresa: [this.idEmpresaSeleccionada, [Validators.required]],
      IdPais: ['', [Validators.required]],
      TipoEmpresa: [null, [Validators.required]],
      IdDepartamento: ['', [Validators.required, Validators.maxLength(2)]],
      IdProvincia: ['', [Validators.required, Validators.maxLength(2)]],
      IdDistrito: ['', [Validators.required, Validators.maxLength(2)]],
      sDireccion: [''],
      sTelefono: ['', [Validators.maxLength(30)]],
      sCelular: ['', [Validators.maxLength(30)]]
    });
  }

  cargarCatalogos(): void {
    // Cargar empresas (ajusta según tu servicio de catálogos)
    this.catalogoService.listarEmpresas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.empresas = response.data;
        }
      },
      error: (error) => console.error('Error al cargar empresas:', error)
    });

    // Nota: Deberías tener servicios para cargar países y tipos de empresa
    // Si no los tienes, usa los servicios que creamos anteriormente
  }

  cargarSucursales(): void {
    this.loading = true;
    this.errorMessage = '';

    this.sucursalService.listarSucursales(this.idEmpresaSeleccionada).subscribe({
      next: (sucursales) => {
        this.loading = false;
        this.sucursales = sucursales;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las sucursales';
        console.error('Error:', error);
      }
    });
  }

  onEmpresaChange(idEmpresa: number): void {
    this.idEmpresaSeleccionada = idEmpresa;
    this.cargarSucursales();
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Sucursal';
    this.sucursalIdEdicion = null;
    
    // Obtener idEmpresa actual del usuario logueado
    const currentUser = this.authService.getCurrentUser();
    const idEmpresaActual = currentUser?.idEmpresa || this.idEmpresaSeleccionada;
    
    this.sucursalForm.reset({
      IdEmpresa: idEmpresaActual
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(sucursal: SucursalList): void {
    // Primero obtenemos los datos completos de la sucursal
    this.sucursalService.obtenerSucursal(sucursal.IdSucursal).subscribe({
      next: (sucursalCompleta) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Sucursal';
        this.sucursalIdEdicion = sucursal.IdSucursal;
        this.sucursalForm.patchValue({
          sCodigo: sucursalCompleta.sCodigo,
          IdEmpresa: sucursalCompleta.IdEmpresa,
          IdPais: sucursalCompleta.IdPais,
          TipoEmpresa: sucursalCompleta.TipoEmpresa,
          IdDepartamento: sucursalCompleta.IdDepartamento,
          IdProvincia: sucursalCompleta.IdProvincia,
          IdDistrito: sucursalCompleta.IdDistrito,
          sDireccion: sucursalCompleta.sDireccion,
          sTelefono: sucursalCompleta.sTelefono,
          sCelular: sucursalCompleta.sCelular
        });
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de la sucursal';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.sucursalForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.sucursalIdEdicion = null;
  }

  guardarSucursal(): void {
    if (this.sucursalForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const sucursalData = {
      sCodigo: this.sucursalForm.value.sCodigo,
      IdEmpresa: this.sucursalForm.value.IdEmpresa,
      IdPais: this.sucursalForm.value.IdPais,
      TipoEmpresa: this.sucursalForm.value.TipoEmpresa,
      IdDepartamento: this.sucursalForm.value.IdDepartamento,
      IdProvincia: this.sucursalForm.value.IdProvincia,
      IdDistrito: this.sucursalForm.value.IdDistrito,
      sDireccion: this.sucursalForm.value.sDireccion || '',
      sTelefono: this.sucursalForm.value.sTelefono || '',
      sCelular: this.sucursalForm.value.sCelular || '',
      Usuario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.sucursalIdEdicion !== null) {
      // Actualizar
      this.sucursalService.actualizarSucursal(this.sucursalIdEdicion, sucursalData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Sucursal actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarSucursales();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la sucursal';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la sucursal';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.sucursalService.crearSucursal(sucursalData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Sucursal creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarSucursales();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear la sucursal';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la sucursal';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.sucursalForm.controls).forEach(key => {
      this.sucursalForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.sucursalForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.sucursalForm.get(campo);
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
