import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuPerfilService } from '../../../core/services/menu-perfil.service';
import { ComboService } from '../../../core/services/combo.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuPerfil } from '../../../core/models/menu-perfil.model';
import { ComboItem } from '../../../core/models/combo.model';

@Component({
  selector: 'app-menu-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu-perfil.component.html',
  styleUrls: ['./menu-perfil.component.scss']
})
export class MenuPerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private menuPerfilService = inject(MenuPerfilService);
  private comboService = inject(ComboService);
  private authService = inject(AuthService);

  menuPerfil: MenuPerfil[] = [];
  perfiles: ComboItem[] = [];
  menus: ComboItem[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  menuPerfilForm!: FormGroup;
  menuPerfilOriginal: { idPerfil: number; idMenu: number } | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCombos();
    this.cargarMenuPerfil();
  }

  inicializarFormulario(): void {
    this.menuPerfilForm = this.fb.group({
      iID_PerfilUsuario: [null, [Validators.required]],
      iID_Menu: [null, [Validators.required]]
    });
  }

  cargarCombos(): void {
    // Cargar perfiles (ID = 18)
    this.comboService.getComboById(18).subscribe({
      next: (data) => {
        this.perfiles = data;
        console.log('✅ Perfiles cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar perfiles:', error);
      }
    });

    // Cargar menús (ID = 19)
    this.comboService.getComboById(19).subscribe({
      next: (data) => {
        this.menus = data;
        console.log('✅ Menús cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar menús:', error);
      }
    });
  }

  cargarMenuPerfil(): void {
    this.loading = true;
    this.errorMessage = '';

    this.menuPerfilService.listarMenuPerfil().subscribe({
      next: (menuPerfil) => {
        this.loading = false;
        this.menuPerfil = menuPerfil;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las asignaciones de menú a perfil';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Asignación de Menú a Perfil';
    this.menuPerfilOriginal = null;
    this.menuPerfilForm.reset();
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(menuPerfil: MenuPerfil): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Asignación de Menú a Perfil';
    this.menuPerfilOriginal = {
      idPerfil: menuPerfil.iID_PerfilUsuario,
      idMenu: menuPerfil.iID_Menu
    };
    
    this.menuPerfilForm.patchValue({
      iID_PerfilUsuario: menuPerfil.iID_PerfilUsuario,
      iID_Menu: menuPerfil.iID_Menu
    });
    
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.menuPerfilForm.reset();
    this.errorModal = '';
    this.successMessage = '';
    this.menuPerfilOriginal = null;
  }

  guardarMenuPerfil(): void {
    if (this.menuPerfilForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    const usuario = currentUser?.nombre?.toLowerCase() || 'admin';

    const menuPerfilData = {
      iID_PerfilUsuario: this.menuPerfilForm.value.iID_PerfilUsuario,
      iID_Menu: this.menuPerfilForm.value.iID_Menu,
      Usuario: usuario
    };

    if (this.modoEdicion && this.menuPerfilOriginal) {
      // Actualizar
      this.menuPerfilService.actualizarMenuPerfil(
        this.menuPerfilOriginal.idPerfil,
        this.menuPerfilOriginal.idMenu,
        menuPerfilData
      ).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Asignación actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarMenuPerfil();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la asignación';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la asignación';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.menuPerfilService.crearMenuPerfil(menuPerfilData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            // Formatear mensaje con múltiples líneas si viene del backend
            const mensaje = response.message || 'Asignación creada exitosamente';
            this.successMessage = mensaje.replace(/\|/g, '\n');
            
            console.log('✅ Asignación guardada:', mensaje);
            
            setTimeout(() => {
              this.cerrarModal();
              this.cargarMenuPerfil();
            }, 2500);
          } else {
            this.errorModal = response.message || 'Error al crear la asignación';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la asignación';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  eliminarMenuPerfil(menuPerfil: MenuPerfil): void {
    if (!confirm(`¿Está seguro de eliminar la asignación del menú "${menuPerfil.MenuDescripcion}" al perfil "${menuPerfil.PerfilNombre}"?`)) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const usuario = currentUser?.nombre?.toLowerCase() || 'admin';

    this.menuPerfilService.eliminarMenuPerfil(
      menuPerfil.iID_PerfilUsuario,
      menuPerfil.iID_Menu,
      usuario
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Asignación eliminada exitosamente';
          this.cargarMenuPerfil();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Error al eliminar la asignación';
        }
      },
      error: (error) => {
        const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al eliminar la asignación';
        this.errorMessage = errorMsg;
        console.error('Error:', error);
      }
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.menuPerfilForm.controls).forEach(key => {
      this.menuPerfilForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.menuPerfilForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.menuPerfilForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }
}

