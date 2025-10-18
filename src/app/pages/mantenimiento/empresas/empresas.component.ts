import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ComboService } from '../../../core/services/combo.service';
import { Empresa } from '../../../core/models/empresa.model';
import { ComboItem } from '../../../core/models/combo.model';
import { MultiSelectTagsComponent } from '../../../shared/components/multi-select-tags/multi-select-tags.component';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectTagsComponent],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class EmpresasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private comboService = inject(ComboService);

  empresas: Empresa[] = [];
  aplicaciones: ComboItem[] = [];
  loading = false;
  errorMessage = '';

  // ✅ NUEVO: Mapa de colores para aplicaciones
  coloresAplicaciones: Map<number, string> = new Map();

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  empresaForm!: FormGroup;
  empresaIdEdicion: number | null = null;

  // Mensajes
  successMessage = '';
  loadingModal = false;
  errorModal = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCatalogos();
    this.cargarEmpresas();
  }

  inicializarFormulario(): void {
    this.empresaForm = this.fb.group({
      Codigo: ['', [Validators.required, Validators.maxLength(20)]],
      RazonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      IdAplicacion: [[], Validators.required]  // ✅ MODIFICADO: Array para multiselect
    });
  }

  /**
   * ✅ NUEVO: Cargar catálogos (aplicaciones)
   */
  cargarCatalogos(): void {
    // Cargar Aplicaciones (ID = 9)
    this.comboService.getAplicaciones().subscribe({
      next: (data) => {
        this.aplicaciones = data;
        this.asignarColoresAplicaciones(data);
        console.log('✅ Aplicaciones cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar aplicaciones:', error);
      }
    });
  }

  cargarEmpresas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.empresaService.listarEmpresas().subscribe({
      next: (empresas) => {
        this.loading = false;
        this.empresas = empresas;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las empresas';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Empresa';
    this.empresaIdEdicion = null;
    this.empresaForm.reset({
      Codigo: '',
      RazonSocial: '',
      IdAplicacion: []  // ✅ Array vacío para multiselect
    });
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoEdicion = true;
    this.tituloModal = 'Editar Empresa';
    this.empresaIdEdicion = empresa.iID_Empresa;
    
    // ✅ Cargar datos completos de la empresa desde el backend (incluye IdAplicacion)
    this.empresaService.obtenerEmpresa(empresa.iID_Empresa).subscribe({
      next: (empresaCompleta) => {
        // Convertir string "1,2,3" a array [1,2,3]
        const aplicacionesArray = empresaCompleta.IdAplicacion 
          ? String(empresaCompleta.IdAplicacion).split(',').map(Number) 
          : [];
        
        this.empresaForm.patchValue({
          Codigo: empresaCompleta.sRuc,
          RazonSocial: empresaCompleta.sRazonSocialE,
          IdAplicacion: aplicacionesArray
        });
        
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
        
        console.log('✅ Empresa cargada para edición:', empresaCompleta);
        console.log('✅ Aplicaciones:', aplicacionesArray);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de la empresa';
        console.error('Error al cargar empresa:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaForm.reset({
      IdAplicacion: []  // ✅ Array vacío para multiselect
    });
    this.errorModal = '';
    this.successMessage = '';
    this.empresaIdEdicion = null;
  }

  guardarEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    // ✅ MODIFICADO: Convertir array [1,2,3] a string "1,2,3"
    const empresaData = {
      Codigo: this.empresaForm.value.Codigo,
      RazonSocial: this.empresaForm.value.RazonSocial,
      IdAplicacion: this.convertirArrayAString(this.empresaForm.value.IdAplicacion),
      Usuaario: 'ADMIN' // Ajusta según tu lógica de usuario actual
    };

    if (this.modoEdicion && this.empresaIdEdicion !== null) {
      // Actualizar
      this.empresaService.actualizarEmpresa(this.empresaIdEdicion, empresaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Empresa actualizada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarEmpresas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar la empresa';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar la empresa';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.empresaService.crearEmpresa(empresaData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Empresa creada exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarEmpresas();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear la empresa';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear la empresa';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.empresaForm.controls).forEach(key => {
      this.empresaForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  campoEsInvalido(campo: string): boolean {
    const control = this.empresaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.empresaForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }

  /**
   * ✅ NUEVO: Convertir array de números a string separado por comas
   * [1, 2, 3] → "1,2,3"
   */
  private convertirArrayAString(valor: any): string {
    if (Array.isArray(valor)) {
      return valor.join(',');
    }
    if (typeof valor === 'string') {
      return valor;
    }
    return '';
  }

  /**
   * ✅ NUEVO: Asignar colores únicos a cada aplicación
   */
  private asignarColoresAplicaciones(aplicaciones: ComboItem[]): void {
    const colores = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
      '#6366f1', // indigo
      '#84cc16', // lime
    ];

    this.coloresAplicaciones.clear();
    
    aplicaciones.forEach((app, index) => {
      const color = colores[index % colores.length];
      this.coloresAplicaciones.set(app.Id, color);
      console.log(`🎨 Aplicación ${app.Id} (${app.Descripcion}): ${color}`);
    });
  }
}
