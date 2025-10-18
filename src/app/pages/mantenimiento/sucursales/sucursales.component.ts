import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SucursalService } from '../../../core/services/sucursal.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { ComboService } from '../../../core/services/combo.service';
import { UbigeoService, UbigeoItem } from '../../../core/services/ubigeo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sucursal, SucursalList } from '../../../core/models/sucursal.model';
import { ComboItem } from '../../../core/models/combo.model';
import { environment } from '../../../../environments/environment';

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
  private comboService = inject(ComboService);
  private ubigeoService = inject(UbigeoService);
  private authService = inject(AuthService);

  sucursales: SucursalList[] = [];
  loading = false;
  errorMessage = '';

  // Catálogos
  empresas: ComboItem[] = [];
  paises: ComboItem[] = [];
  tiposEmpresa: ComboItem[] = [];
  
  // Ubigeo (filtrado en cascada)
  departamentos: UbigeoItem[] = [];
  provincias: UbigeoItem[] = [];
  distritos: UbigeoItem[] = [];
  
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
    this.configurarFiltradoCascada();
    this.cargarCatalogos();
    this.cargarSucursales();
  }

  inicializarFormulario(): void {
    this.sucursalForm = this.fb.group({
      sCodigo: ['', [Validators.required, Validators.maxLength(10)]],
      IdEmpresa: [null, [Validators.required]],
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
    // Cargar Empresas (ID = 16)
    this.comboService.getEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
        console.log('✅ Empresas cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar empresas:', error);
      }
    });

    // Cargar Países (ID = 1 o 6)
    this.comboService.getPaises().subscribe({
      next: (data) => {
        this.paises = data;
        console.log('✅ Países cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar países:', error);
      }
    });

    // Cargar Tipos de Empresa (ID = 17)
    this.comboService.getTiposEmpresa().subscribe({
      next: (data) => {
        this.tiposEmpresa = data;
        console.log('✅ Tipos de Empresa cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar tipos de empresa:', error);
      }
    });
  }

  /**
   * Mapeo de IDs de país a formato de GEN_Ubigeo
   * Según tus datos:
   * - GEN_Pais.IdPais = 106 para PERU
   * - GEN_Pais.sIdPais = "001" para PERU
   * - GEN_Pais.sCodigo = "PE" para PERU
   * - GEN_Ubigeo.sIdPais = "001" para PERU ✅ Este es el que necesitamos
   */
  private mapearIdPaisAUbigeo(idPais: string | number): string {
    const idStr = String(idPais);
    
    // Si ya es un ID numérico de 3 dígitos (ej: "001"), usarlo directamente
    if (/^\d{3}$/.test(idStr)) {
      console.log(`✅ ID País ya está en formato correcto: "${idStr}"`);
      return idStr;
    }
    
    // Mapeo desde IdPais numérico (106) → sIdPais ("001")
    const mapeoNumerico: { [key: string]: string } = {
      '106': '001',  // Perú (IdPais 106 → sIdPais "001")
      '27': '042',   // Chile (IdPais 27 → sIdPais "042")
      '30': '040',   // Colombia (IdPais 30 → sIdPais "040")
      '90': '050',   // México (IdPais 90 → sIdPais "050")
      '9': '035',    // Argentina (IdPais 9 → sIdPais "035")
      '21': '038',   // Brasil (IdPais 21 → sIdPais "038")
      '19': '037',   // Bolivia (IdPais 19 → sIdPais "037")
      '37': '043',   // Ecuador (IdPais 37 → sIdPais "043")
      '105': '053',  // Paraguay (IdPais 105 → sIdPais "053")
      '142': '058',  // Uruguay (IdPais 142 → sIdPais "058")
      '145': '059',  // Venezuela (IdPais 145 → sIdPais "059")
    };
    
    // Mapeo desde código ISO (PE) → sIdPais ("001")
    const mapeoCodigo: { [key: string]: string } = {
      'PE': '001',   // Perú
      'CL': '042',   // Chile
      'CO': '040',   // Colombia
      'MX': '050',   // México
      'AR': '035',   // Argentina
      'BR': '038',   // Brasil
      'BO': '037',   // Bolivia
      'EC': '043',   // Ecuador
      'PY': '053',   // Paraguay
      'UY': '058',   // Uruguay
      'VE': '059',   // Venezuela
    };
    
    // Intentar mapear
    let idMapeado = mapeoNumerico[idStr] || mapeoCodigo[idStr] || idStr;
    
    // Si es un número de 1-3 dígitos, rellenar con ceros a la izquierda
    if (/^\d{1,2}$/.test(idMapeado)) {
      idMapeado = idMapeado.padStart(3, '0');
      console.log(`🔄 ID rellenado con ceros: "${idStr}" → "${idMapeado}"`);
    }
    
    if (idMapeado !== idStr) {
      console.log(`🔄 ID País mapeado: "${idStr}" → "${idMapeado}"`);
    }
    
    return idMapeado;
  }

  /**
   * Configurar filtrado en cascada de ubicaciones
   */
  configurarFiltradoCascada(): void {
    // Al cambiar País → Cargar Departamentos
    this.sucursalForm.get('IdPais')?.valueChanges.subscribe((idPais: string) => {
      console.log('═══════════════════════════════════════');
      console.log('🌍 País seleccionado (valor original):', idPais);
      console.log('🔍 Tipo de dato:', typeof idPais);
      console.log('📏 Longitud:', idPais?.length);
      
      // Limpiar dependencias
      this.departamentos = [];
      this.provincias = [];
      this.distritos = [];
      this.sucursalForm.patchValue({
        IdDepartamento: '',
        IdProvincia: '',
        IdDistrito: ''
      }, { emitEvent: false });
      
      if (idPais && idPais.trim() !== '') {
        // ⚠️ Mapear ID antes de enviar
        const idPaisMapeado = this.mapearIdPaisAUbigeo(idPais);
        console.log('🎯 ID final que se enviará al backend:', idPaisMapeado);
        console.log('═══════════════════════════════════════');
        this.cargarDepartamentos(idPaisMapeado);
      }
    });

    // Al cambiar Departamento → Cargar Provincias
    this.sucursalForm.get('IdDepartamento')?.valueChanges.subscribe((idDepartamento: string) => {
      console.log('🏛️ Departamento seleccionado:', idDepartamento);
      
      // Limpiar dependencias
      this.provincias = [];
      this.distritos = [];
      this.sucursalForm.patchValue({
        IdProvincia: '',
        IdDistrito: ''
      }, { emitEvent: false });
      
      const idPais = this.sucursalForm.get('IdPais')?.value;
      if (idPais && idDepartamento && idDepartamento.trim() !== '') {
        this.cargarProvincias(idPais, idDepartamento);
      }
    });

    // Al cambiar Provincia → Cargar Distritos
    this.sucursalForm.get('IdProvincia')?.valueChanges.subscribe((idProvincia: string) => {
      console.log('🏘️ Provincia seleccionada:', idProvincia);
      
      // Limpiar dependencias
      this.distritos = [];
      this.sucursalForm.patchValue({
        IdDistrito: ''
      }, { emitEvent: false });
      
      const idPais = this.sucursalForm.get('IdPais')?.value;
      const idDepartamento = this.sucursalForm.get('IdDepartamento')?.value;
      if (idPais && idDepartamento && idProvincia && idProvincia.trim() !== '') {
        this.cargarDistritos(idPais, idDepartamento, idProvincia);
      }
    });
  }

  /**
   * Cargar departamentos por país
   */
  cargarDepartamentos(idPais: string): void {
    console.log('🔄 Cargando departamentos para país:', idPais);
    console.log('📡 URL completa:', `${environment.apiUrl}/ubigeo/departamentos/${idPais}`);
    
    this.ubigeoService.getDepartamentosPorPais(idPais).subscribe({
      next: (data) => {
        this.departamentos = data;
        console.log('✅ Departamentos recibidos:', data.length, 'departamentos');
        console.log('📊 Primeros 5 departamentos:', data.slice(0, 5));
        console.log('📊 Estructura del primer item:', data[0]);
        
        if (data.length === 0) {
          console.warn('⚠️ No se recibieron departamentos. Verifica:');
          console.warn('   1. Que el procedimiento GEN_ListaDepartamentos exista');
          console.warn('   2. Que existan datos en GEN_Ubigeo para IdPais:', idPais);
          this.errorModal = `No se encontraron departamentos para el país seleccionado.`;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar departamentos:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ URL intentada:', error.url);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Error completo:', error);
        
        this.departamentos = [];
        
        if (error.status === 404) {
          this.errorModal = 'Endpoint de departamentos no encontrado. Verifica que el backend esté actualizado.';
        } else if (error.status === 500) {
          this.errorModal = `Error del servidor al cargar departamentos. Posible error en procedimiento SQL.`;
        } else {
          this.errorModal = `No se pudieron cargar departamentos del país ${idPais}.`;
        }
      }
    });
  }

  /**
   * Cargar provincias por país y departamento
   */
  cargarProvincias(idPais: string, idDepartamento: string): void {
    this.ubigeoService.getProvinciasPorDepartamento(idPais, idDepartamento).subscribe({
      next: (data) => {
        this.provincias = data;
        console.log('✅ Provincias cargadas:', data.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar provincias:', error);
        this.provincias = [];
      }
    });
  }

  /**
   * Cargar distritos por país, departamento y provincia
   */
  cargarDistritos(idPais: string, idDepartamento: string, idProvincia: string): void {
    this.ubigeoService.getDistritosPorProvincia(idPais, idDepartamento, idProvincia).subscribe({
      next: (data) => {
        this.distritos = data;
        console.log('✅ Distritos cargados:', data.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar distritos:', error);
        this.distritos = [];
      }
    });
  }

  cargarSucursales(): void {
    this.loading = true;
    this.errorMessage = '';

    // Cargar sucursales de la empresa del usuario logueado
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

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nueva Sucursal';
    this.sucursalIdEdicion = null;
    
    // Reset completo del formulario sin valores predeterminados
    this.sucursalForm.reset({
      sCodigo: '',
      IdEmpresa: null,
      IdPais: '',
      TipoEmpresa: null,
      IdDepartamento: '',
      IdProvincia: '',
      IdDistrito: '',
      sDireccion: '',
      sTelefono: '',
      sCelular: ''
    });
    
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(sucursal: SucursalList): void {
    console.log('📝 Abriendo modal para editar sucursal:', sucursal.IdSucursal);
    
    // Primero obtenemos los datos completos de la sucursal
    this.sucursalService.obtenerSucursal(sucursal.IdSucursal).subscribe({
      next: (sucursalCompleta) => {
        console.log('📊 Datos de sucursal cargados:', sucursalCompleta);
        
        this.modoEdicion = true;
        this.tituloModal = 'Editar Sucursal';
        this.sucursalIdEdicion = sucursal.IdSucursal;
        
        // Mapear el IdPais antes de cargar ubicaciones
        const idPaisMapeado = this.mapearIdPaisAUbigeo(sucursalCompleta.IdPais);
        console.log('🗺️ Cargando ubicaciones en cascada para edición...');
        console.log('   País:', idPaisMapeado);
        console.log('   Departamento:', sucursalCompleta.IdDepartamento);
        console.log('   Provincia:', sucursalCompleta.IdProvincia);
        console.log('   Distrito:', sucursalCompleta.IdDistrito);
        
        // Cargar ubicaciones en cascada antes de setear valores
        if (idPaisMapeado) {
          // 1. Cargar departamentos del país
          this.cargarDepartamentos(idPaisMapeado);
          
          if (sucursalCompleta.IdDepartamento) {
            // 2. Cargar provincias del departamento (después de un delay)
            setTimeout(() => {
              this.cargarProvincias(idPaisMapeado, sucursalCompleta.IdDepartamento);
              
              if (sucursalCompleta.IdProvincia) {
                // 3. Cargar distritos de la provincia (después de otro delay)
                setTimeout(() => {
                  this.cargarDistritos(idPaisMapeado, sucursalCompleta.IdDepartamento, sucursalCompleta.IdProvincia);
                }, 300);
              }
            }, 300);
          }
        }
        
        // Setear valores en el formulario (después de cargar los combos)
        setTimeout(() => {
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
          
          console.log('✅ Formulario cargado con valores de la sucursal');
        }, 100);
        
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de la sucursal';
        console.error('❌ Error al obtener sucursal:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.sucursalForm.reset();
    
    // Limpiar ubicaciones
    this.departamentos = [];
    this.provincias = [];
    this.distritos = [];
    
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
