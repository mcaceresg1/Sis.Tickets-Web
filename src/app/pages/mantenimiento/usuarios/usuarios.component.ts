import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';  // ✅ NUEVO IMPORT para llamadas paralelas
import { UsuarioMantenimientoService } from '../../../core/services/usuario-mantenimiento.service';
import { ComboService } from '../../../core/services/combo.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioList } from '../../../core/models/usuario-mantenimiento.model';
import { ComboItem } from '../../../core/models/combo.model';
import { Perfil } from '../../../core/models/catalogo.model';
import { MultiSelectTagsComponent } from '../../../shared/components/multi-select-tags/multi-select-tags.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectTagsComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioMantenimientoService);
  private comboService = inject(ComboService);
  private catalogoService = inject(CatalogoService);
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);

  usuarios: UsuarioList[] = [];
  loading = false;
  errorMessage = '';

  // Catálogos
  perfiles: any[] = [];
  empresas: ComboItem[] = [];
  sucursales: ComboItem[] = [];
  tiposDocumento: ComboItem[] = [];
  sistemas: ComboItem[] = [];               // ✅ NUEVO: Sistemas
  modulos: ComboItem[] = [];                // Módulos filtrados por sistema
  modulosCompletos: ComboItem[] = [];       // ✅ TODOS los módulos
  paginas: ComboItem[] = [];                // Páginas filtradas por módulo
  paginasCompletas: ComboItem[] = [];       // ✅ TODAS las páginas
  impactos: ComboItem[] = [];
  prioridades: ComboItem[] = [];
  estados: ComboItem[] = [];
  
  // ✅ Mapas de colores por nivel
  coloresSistemas: Map<number, string> = new Map();
  coloresModulos: Map<number, string> = new Map();
  coloresPaginas: Map<number, string> = new Map();

  // Info del usuario logueado
  idEmpresaUsuario: number = 1;
  idPerfilUsuario: number = 1;

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  tituloModal = '';
  usuarioForm!: FormGroup;
  usuarioIdEdicion: number | null = null;
  usuarioActual: any = null;  // ✅ NUEVO: Guardar usuario actual para comparar

  // Tabs del formulario
  tabActiva: number = 0;

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
    }

    this.inicializarFormulario();
    this.cargarCatalogos();  // Primero cargar catálogos
    this.configurarFiltradoCascada();  // Después configurar filtrado
    this.cargarUsuarios();
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      // Datos de Acceso (Tab 1)
      sUsuario: ['', [Validators.required, Validators.maxLength(50)]],
      sClave: ['', [Validators.required, Validators.maxLength(100)]],
      
      // Datos Personales (Tab 2)
      sNombre: ['', [Validators.required, Validators.maxLength(100)]],
      ApePaterno: ['', [Validators.required, Validators.maxLength(100)]],
      ApeMaterno: ['', Validators.maxLength(100)],
      IdDocumento: ['', Validators.required],
      sNumero: ['', [Validators.required, Validators.maxLength(50)]],
      
      // Permisos y Asignación (Tab 3)
      IdPerfil: [null, Validators.required],
      IdEmpresa: [null, Validators.required],  // ✅ Sin valor por defecto
      IdSucursal: [null],  // ✅ OPCIONAL: Sucursal no es obligatoria
      
      // Datos de Contacto (Tab 4)
      Correo: ['', [Validators.email, Validators.maxLength(200)]],
      sTelefono: ['', Validators.maxLength(20)],
      sDireccion: ['', Validators.maxLength(500)],
      sCargo: ['', Validators.maxLength(30)],
      
      // Workgroups (Tab 5)
      workgroup1: ['', Validators.maxLength(30)],
      workgroup2: ['', Validators.maxLength(30)],
      workgroup3: ['', Validators.maxLength(30)],
      workgroup4: ['', Validators.maxLength(30)],
      workgroup5: ['', Validators.maxLength(30)],
      workgroup6: ['', Validators.maxLength(30)],
      workgroup7: ['', Validators.maxLength(30)],
      workgroup8: ['', Validators.maxLength(30)],
      workgroup9: ['', Validators.maxLength(30)],
      workgroup10: ['', Validators.maxLength(30)],
      
      // Configuración Adicional (Tab 6)
      sImagen: ['', Validators.maxLength(100)],
      IdSistema: [null],    // ✅ NUEVO: Sistema (single select)
      IdModulo: [[]],       // Array para multiselect de módulos
      IdPagina: [[]],       // Array para multiselect de páginas
      sImpacto: [null],
      sPrioridad: [null],
      sEstadoC: [null]
    });
  }

  cargarCatalogos(): void {
    // Cargar Sistemas (ID = 16)
    this.comboService.getSistemas().subscribe({
      next: (data) => {
        this.sistemas = data;
        this.asignarColoresSistemas(data);  // ✅ Asignar colores a sistemas
        console.log('✅ Sistemas cargados:', data);
      },
      error: (error) => console.error('❌ Error al cargar sistemas:', error)
    });

    // Cargar Perfiles
    this.perfilService.listarPerfiles(this.idEmpresaUsuario, this.idPerfilUsuario).subscribe({
      next: (response) => {
        this.perfiles = response;
      },
      error: (error) => console.error('Error al cargar perfiles:', error)
    });

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

    // Cargar Sucursales (ID = 7)
    this.comboService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        console.log('✅ Sucursales cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar sucursales:', error);
      }
    });

    // Cargar Tipos de Documento (ID = 8)
    this.comboService.getTiposDocumento().subscribe({
      next: (data) => {
        this.tiposDocumento = data;
        console.log('✅ Tipos de Documento cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar tipos de documento:', error);
      }
    });

    // Cargar TODOS los Módulos (ID = 9)
    this.comboService.getModulos().subscribe({
      next: (data) => {
        this.modulosCompletos = data;  // ✅ Guardar TODOS los módulos
        this.modulos = [];              // Inicialmente vacío (se filtrará por sistema)
        console.log('✅ Módulos completos cargados:', data.length, 'módulos');
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos:', error);
      }
    });

    // Cargar TODAS las Páginas (ID = 11)
    this.comboService.getAllPaginas().subscribe({
      next: (data) => {
        this.paginasCompletas = data;  // ✅ Guardar TODAS las páginas
        this.paginas = [];             // Inicialmente vacío (se filtrará por módulos)
        console.log('✅ Páginas completas cargadas:', data.length, 'páginas');
      },
      error: (error) => {
        console.error('❌ Error al cargar páginas:', error);
      }
    });

    // Cargar Impactos (ID = 5)
    this.comboService.getNivelesUrgencia().subscribe({
      next: (data) => {
        this.impactos = data;
        console.log('✅ Impactos cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar impactos:', error);
      }
    });

    // Cargar Prioridades (ID = 3)
    this.comboService.getPrioridades().subscribe({
      next: (data) => {
        this.prioridades = data;
        console.log('✅ Prioridades cargadas:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar prioridades:', error);
      }
    });

    // Cargar Estados (ID = 4)
    this.comboService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
        console.log('✅ Estados cargados:', data);
      },
      error: (error) => {
        console.error('❌ Error al cargar estados:', error);
      }
    });
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.errorMessage = '';

    // ✅ Filtrar usuarios por la empresa del usuario logueado
    this.usuarioService.listarUsuarios(this.idEmpresaUsuario).subscribe({
      next: (usuarios) => {
        this.loading = false;
        this.usuarios = usuarios;
        console.log(`✅ Usuarios cargados (Empresa ${this.idEmpresaUsuario}):`, usuarios.length);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los usuarios';
        console.error('Error:', error);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.tituloModal = 'Nuevo Usuario';
    this.usuarioIdEdicion = null;
    this.usuarioActual = null;  // ✅ Limpiar usuario actual
    this.tabActiva = 0;
    
    // ✅ Reset FORZADO de todos los campos
    this.usuarioForm.reset();
    
    // ✅ Establecer explícitamente valores vacíos para arrays
    this.usuarioForm.patchValue({
      sUsuario: '',      // ✅ Explícitamente vacío
      sClave: '',        // ✅ Explícitamente vacío
      IdEmpresa: null,   // ✅ Sin pre-selección - usuario elige manualmente
      IdSistema: null,   // ✅ Sin pre-selección - usuario elige manualmente
      IdModulo: [],      // Arrays vacíos para multiselects
      IdPagina: []       // Arrays vacíos para multiselects
    });
    
    // ✅ En modo NUEVO, Usuario y Contraseña son REQUERIDOS
    this.usuarioForm.get('sUsuario')?.setValidators([Validators.required, Validators.maxLength(50)]);
    this.usuarioForm.get('sClave')?.setValidators([Validators.required, Validators.maxLength(100)]);
    this.usuarioForm.get('sUsuario')?.updateValueAndValidity();
    this.usuarioForm.get('sClave')?.updateValueAndValidity();
    
    // ✅ Limpiar módulos y páginas (se cargarán al seleccionar sistema)
    this.modulos = [];
    this.paginas = [];
    
    // ✅ Campo IdEmpresa habilitado - puede seleccionar cualquier empresa
    this.usuarioForm.get('IdEmpresa')?.enable();
    
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
  }

  abrirModalEditar(usuario: UsuarioList): void {
    // Obtener los datos completos del usuario
    this.usuarioService.obtenerUsuario(usuario.iID_Usuario).subscribe({
      next: (usuarioCompleto) => {
        this.modoEdicion = true;
        this.tituloModal = 'Editar Usuario';
        this.usuarioIdEdicion = usuario.iID_Usuario;
        this.usuarioActual = usuarioCompleto;  // ✅ NUEVO: Guardar datos originales
        this.tabActiva = 0;
        
        // ✅ En modo EDICIÓN, Usuario y Contraseña siguen siendo REQUERIDOS
        this.usuarioForm.get('sUsuario')?.setValidators([Validators.required, Validators.maxLength(50)]);
        this.usuarioForm.get('sClave')?.setValidators([Validators.required, Validators.maxLength(100)]);
        this.usuarioForm.get('sUsuario')?.updateValueAndValidity();
        this.usuarioForm.get('sClave')?.updateValueAndValidity();
        
        // ✅ Primero cargar datos básicos (sin IdModulo e IdPagina todavía)
        this.usuarioForm.patchValue({
          sUsuario: usuarioCompleto.sUsuario,  // ✅ Mostrar usuario actual
          sClave: usuarioCompleto.Pass,        // ✅ Mostrar contraseña desencriptada
          sNombre: usuarioCompleto.sNombres,
          ApePaterno: usuarioCompleto.sApePaterno,
          ApeMaterno: usuarioCompleto.sApeMaterno,
          IdDocumento: usuarioCompleto.iID_DocumnetoI || null,
          sNumero: usuarioCompleto.sNumDocumentoI,
          IdPerfil: usuarioCompleto.iId_perfilusuario,
          IdEmpresa: usuarioCompleto.IdEmpresa,
          IdSucursal: usuarioCompleto.IdSucursal,
          Correo: usuarioCompleto.sCorreoElectronico || '',
          sTelefono: usuarioCompleto.sTelefono || '',
          sDireccion: usuarioCompleto.sDireccion || '',
          sCargo: usuarioCompleto.sCargo || '',
          workgroup1: usuarioCompleto.workgroup1 || '',
          workgroup2: usuarioCompleto.workgroup2 || '',
          workgroup3: usuarioCompleto.workgroup3 || '',
          workgroup4: usuarioCompleto.workgroup4 || '',
          workgroup5: usuarioCompleto.workgroup5 || '',
          workgroup6: usuarioCompleto.workgroup6 || '',
          workgroup7: usuarioCompleto.workgroup7 || '',
          workgroup8: usuarioCompleto.workgroup8 || '',
          workgroup9: usuarioCompleto.workgroup9 || '',
          workgroup10: usuarioCompleto.workgroup10 || '',
          sImagen: usuarioCompleto.sImgen || '',
          IdSistema: usuarioCompleto.IdSistema || null,  // ✅ NUEVO: Sistema
          sImpacto: this.convertirANumero(usuarioCompleto.sImpacto),
          sPrioridad: this.convertirANumero(usuarioCompleto.sPrioridad),
          sEstadoC: this.convertirANumero(usuarioCompleto.sEstadoC)
        });
        
        // ✅ DESPUÉS cargar módulos y asignar valores
        if (usuarioCompleto.IdSistema) {
          this.comboService.getModulosPorSistema(usuarioCompleto.IdSistema).subscribe({
            next: (data) => {
              this.modulos = data;
              this.asignarColoresModulos(this.modulos);
              console.log('✅ Módulos cargados para edición:', this.modulos.length);
              console.log('📦 Módulos disponibles:', this.modulos);
              
              // ✅ Ahora SÍ asignar los módulos seleccionados
              if (usuarioCompleto.IdModulo) {
                const idsModulos = String(usuarioCompleto.IdModulo).split(',').map(Number);
                console.log('📋 Asignando módulos seleccionados:', idsModulos);
                
                // Asignar con un pequeño delay para asegurar que el componente esté listo
                setTimeout(() => {
                  this.usuarioForm.patchValue({ 
                    IdModulo: idsModulos 
                  }, { emitEvent: false });
                  
                  console.log('✅ Módulos asignados al form:', idsModulos);
                  
                  // Ahora cargar páginas de esos módulos
                  this.filtrarPaginasPorModulos(idsModulos);
                }, 200);
              }
            },
            error: (error) => {
              console.error('❌ Error al cargar módulos:', error);
              this.modulos = [];
            }
          });
        } else {
          // Si no hay sistema, asignar módulos vacíos
          this.usuarioForm.patchValue({ 
            IdModulo: [],
            IdPagina: []
          }, { emitEvent: false });
        }
        
        // ✅ Campo IdEmpresa habilitado - puede cambiar de empresa
        this.usuarioForm.get('IdEmpresa')?.enable();
        
        console.log('✅ Usuario cargado para edición:', usuarioCompleto);
        console.log('✅ Valores pre-seleccionados:', {
          TipoDocumento: usuarioCompleto.iID_DocumnetoI,
          Modulos: usuarioCompleto.IdModulo,
          Paginas: usuarioCompleto.IdPagina,
          Impacto: usuarioCompleto.sImpacto,
          Prioridad: usuarioCompleto.sPrioridad,
          Estado: usuarioCompleto.sEstadoC
        });
        
        this.mostrarModal = true;
        this.errorModal = '';
        this.successMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos del usuario';
        console.error('Error:', error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioForm.reset({
      IdModulo: [],      // ✅ Limpiar multiselects
      IdPagina: []
    });
    this.usuarioForm.get('IdEmpresa')?.enable();  // ✅ Re-habilitar campo IdEmpresa
    this.modulos = [];     // ✅ Limpiar módulos disponibles
    this.paginas = [];     // ✅ Limpiar páginas disponibles
    this.errorModal = '';
    this.successMessage = '';
    this.usuarioIdEdicion = null;
    this.tabActiva = 0;
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorModal = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loadingModal = true;
    this.errorModal = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    const usuario = currentUser?.nombre?.toLowerCase() || 'admin';
    
    // ✅ USAR getRawValue() para obtener también campos deshabilitados (como IdEmpresa)
    const formValue = this.usuarioForm.getRawValue();

    const usuarioData = {
      sUsuario: formValue.sUsuario,
      sClave: formValue.sClave,
      sNombre: formValue.sNombre,
      ApePaterno: formValue.ApePaterno,
      ApeMaterno: formValue.ApeMaterno || '',
      IdPerfil: this.convertirANumero(formValue.IdPerfil),  // ✅ Convertir a número
      IdEmpresa: this.convertirANumero(formValue.IdEmpresa),  // ✅ Convertir a número
      IdSucursal: this.convertirANumero(formValue.IdSucursal),  // ✅ NULL si vacío
      IdDocumento: this.convertirANumero(formValue.IdDocumento),  // ✅ Convertir a número
      sNumero: formValue.sNumero,
      Correo: formValue.Correo || '',
      sTelefono: formValue.sTelefono || '',
      sDireccion: formValue.sDireccion || '',
      sCargo: formValue.sCargo || '',
      sImagen: formValue.sImagen || '',
      workgroup1: formValue.workgroup1 || '',
      workgroup2: formValue.workgroup2 || '',
      workgroup3: formValue.workgroup3 || '',
      workgroup4: formValue.workgroup4 || '',
      workgroup5: formValue.workgroup5 || '',
      workgroup6: formValue.workgroup6 || '',
      workgroup7: formValue.workgroup7 || '',
      workgroup8: formValue.workgroup8 || '',
      workgroup9: formValue.workgroup9 || '',
      workgroup10: formValue.workgroup10 || '',
      IdSistema: this.convertirANumero(formValue.IdSistema) || 1,  // ✅ Sistema (default 1)
      IdModulo: this.convertirArrayAString(formValue.IdModulo),
      IdPagina: this.convertirArrayAString(formValue.IdPagina),
      sImpacto: formValue.sImpacto || null,
      sPrioridad: formValue.sPrioridad || null,
      sEstadoC: formValue.sEstadoC || null,
      Usuario: usuario
    };

    console.log('📤 Datos a enviar al backend:', usuarioData);

    if (this.modoEdicion && this.usuarioIdEdicion !== null) {
      // Actualizar
      this.usuarioService.actualizarUsuario(this.usuarioIdEdicion, usuarioData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Usuario actualizado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarUsuarios();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al actualizar el usuario';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al actualizar el usuario';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    } else {
      // Crear
      this.usuarioService.crearUsuario(usuarioData).subscribe({
        next: (response) => {
          this.loadingModal = false;
          if (response.success) {
            this.successMessage = response.message || 'Usuario creado exitosamente';
            setTimeout(() => {
              this.cerrarModal();
              this.cargarUsuarios();
            }, 1500);
          } else {
            this.errorModal = response.message || 'Error al crear el usuario';
          }
        },
        error: (error) => {
          this.loadingModal = false;
          const errorMsg = error.error?.errors?.[0] || error.error?.message || 'Error al crear el usuario';
          this.errorModal = errorMsg;
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      this.usuarioForm.get(key)?.markAsTouched();
    });
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.usuarioForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }

  /**
   * ✅ NUEVO: Configurar filtrado en cascada: Sistema → Módulos → Páginas
   */
  private configurarFiltradoCascada(): void {
    // Cuando cambia el sistema, filtrar módulos
    this.usuarioForm.get('IdSistema')?.valueChanges.subscribe((idSistema: number | null) => {
      console.log('🏢 Sistema seleccionado:', idSistema);
      this.filtrarModulosPorSistema(idSistema);
    });

    // Cuando cambian los módulos, filtrar páginas
    this.usuarioForm.get('IdModulo')?.valueChanges.subscribe((modulosSeleccionados: number[]) => {
      console.log('📦 Módulos seleccionados:', modulosSeleccionados);
      this.filtrarPaginasPorModulos(modulosSeleccionados);
    });
  }

  /**
   * ✅ Filtrar módulos según el sistema seleccionado (llamada al backend)
   */
  private filtrarModulosPorSistema(idSistema: number | null): void {
    console.log('🔍 filtrarModulosPorSistema llamado con:', idSistema);
    
    // Si no hay sistema seleccionado, limpiar módulos y páginas
    if (!idSistema) {
      this.modulos = [];
      this.paginas = [];
      this.usuarioForm.patchValue({ IdModulo: [], IdPagina: [] }, { emitEvent: false });
      console.log('⚠️ No hay sistema seleccionado, módulos y páginas limpiados');
      return;
    }

    // Llamar al backend para obtener módulos del sistema
    this.comboService.getModulosPorSistema(idSistema).subscribe({
      next: (data) => {
        this.modulos = data;
        this.asignarColoresModulos(this.modulos);
        
        // Limpiar páginas
        this.paginas = [];
        this.usuarioForm.patchValue({ IdModulo: [], IdPagina: [] }, { emitEvent: false });
        
        console.log(`✅ Módulos filtrados para sistema ${idSistema}:`, this.modulos.length);
        console.log('📋 Módulos disponibles:', this.modulos);
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos por sistema:', error);
        this.modulos = [];
      }
    });
  }

  /**
   * ✅ Filtrar páginas según los módulos seleccionados
   */
  private filtrarPaginasPorModulos(idsModulos: number[]): void {
    // Si no hay módulos seleccionados, limpiar páginas
    if (!idsModulos || idsModulos.length === 0) {
      this.paginas = [];
      this.usuarioForm.patchValue({ IdModulo: [] }, { emitEvent: false });
      console.log('⚠️ No hay módulos seleccionados, páginas limpiadas');
      return;
    }

    // Si no hay módulos completos cargados, esperar
    if (this.paginasCompletas.length === 0) {
      console.log('⏳ Esperando carga de módulos completos...');
      return;
    }

    // Filtrar módulos usando forkJoin para obtener módulos de cada aplicación
    const requests = idsModulos.map(idModulo => 
      this.comboService.getPaginasPorModulo(idModulo)
    );

    forkJoin(requests).subscribe({
      next: (resultados) => {
        // Combinar todos los resultados y eliminar duplicados
        const modulosUnicos = new Map<number, ComboItem>();
        
        // ✅ NUEVO: Guardar relación módulo → página para colores
          const paginasPorModulo: { idModulo: number; paginas: ComboItem[] }[] = [];
          
          resultados.forEach((paginas, index) => {
            const idModulo = idsModulos[index];
            paginasPorModulo.push({ idModulo, paginas });
          
            paginas.forEach((pagina: ComboItem) => {
              modulosUnicos.set(pagina.Id, pagina);
            });
          });

        this.paginas = Array.from(modulosUnicos.values());
        
        // ✅ NUEVO: Asignar colores a los módulos según su aplicación
        this.asignarColoresPaginas(paginasPorModulo);
        
        console.log('✅ Páginas filtradas:', this.paginas.length, 'de', this.paginasCompletas.length);
        console.log('📋 Módulos seleccionados:', idsModulos);
        console.log('📦 Páginas disponibles:', this.paginas.map(m => `${m.Id}: ${m.Descripcion}`));

        // ✅ NO limpiar módulos seleccionados - solo estamos filtrando páginas
        // Los módulos seleccionados deben permanecer intactos
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos por aplicación:', error);
        this.paginas = [];
      }
    });
  }

  /**
   * Convertir valor a número si es posible, sino retornar null
   */
  private convertirANumero(valor: any): number | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const numero = parseInt(valor, 10);
    return isNaN(numero) ? null : numero;
  }

  /**
   * Convertir array de números a string separado por comas
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
   * ✅ NUEVO: Asignar colores únicos a cada sistema
   */
  private asignarColoresSistemas(sistemas: ComboItem[]): void {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    this.coloresSistemas.clear();
    sistemas.forEach((sistema, index) => {
      const color = colores[index % colores.length];
      this.coloresSistemas.set(sistema.Id, color);
    });
  }

  /**
   * ✅ NUEVO: Asignar colores únicos a cada módulo
   */
  private asignarColoresModulos(modulos: ComboItem[]): void {
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

    this.coloresModulos.clear();
    
    modulos.forEach((mod, index) => {
      const color = colores[index % colores.length];
      this.coloresModulos.set(mod.Id, color);
    });
  }

  /**
   * ✅ NUEVO: Asignar a cada módulo el color de su aplicación padre
   */
  private asignarColoresPaginas(paginasPorModulo: { idModulo: number; paginas: ComboItem[] }[]): void {
    this.coloresPaginas.clear();
    
    paginasPorModulo.forEach(({ idModulo, paginas }) => {
      const colorModulo = this.coloresModulos.get(idModulo);
      
      if (colorModulo) {
        paginas.forEach((pagina: ComboItem) => {
          this.coloresPaginas.set(pagina.Id, colorModulo);
          console.log(`  🎨 Página ${pagina.Id} (${pagina.Descripcion}) → ${colorModulo} (de módulo ${idModulo})`);
        });
      }
    });

    console.log('✅ Colores de módulos asignados:', this.coloresPaginas.size, 'módulos');
  }

  /**
   * ✅ NUEVO: Obtener módulos a partir de string de IDs
   * "1,2,4" → [{ id: 1, nombre: "Sistema Tickets" }, { id: 2, nombre: "ERP" }, ...]
   */
  obtenerModulos(idsString: string): { id: number; nombre: string }[] {
    if (!idsString || idsString.trim() === '') {
      return [];
    }

    const ids = idsString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    
    return ids.map(id => {
      const modulo = this.paginasCompletas.find(mod => mod.Id === id);
      return {
        id,
        nombre: modulo ? modulo.Descripcion : `Mod ${id}`
      };
    });
  }

  /**
   * ✅ NUEVO: Obtener color de un módulo
   */
  obtenerColorModulo(id: number): string {
    return this.coloresModulos.get(id) || '#6b7280'; // gris por defecto
  }
  
  /**
   * ✅ NUEVO: Obtener color de una página (hereda del color de su módulo padre)
   */
  obtenerColorPagina(id: number): string {
    return this.coloresPaginas.get(id) || '#6b7280'; // gris por defecto
  }
}
