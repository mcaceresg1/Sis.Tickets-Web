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
  aplicaciones: ComboItem[] = [];
  modulos: ComboItem[] = [];                 // Módulos filtrados por aplicación
  modulosCompletos: ComboItem[] = [];        // ✅ TODOS los módulos (sin filtrar)
  impactos: ComboItem[] = [];
  prioridades: ComboItem[] = [];
  estados: ComboItem[] = [];
  
  // ✅ NUEVO: Mapas de colores
  coloresAplicaciones: Map<number, string> = new Map();
  coloresModulos: Map<number, string> = new Map();

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
    this.configurarFiltroModulosPorAplicacion();  // ✅ NUEVO: Configurar filtrado dinámico
    this.cargarCatalogos();
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
      IdSucursal: [null, Validators.required],
      
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
      IdAplicacion: [[]],  // Array para multiselect
      IdModulo: [[]],      // Array para multiselect
      sImpacto: [null],
      sPrioridad: [null],
      sEstadoC: [null]
    });
  }

  cargarCatalogos(): void {
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

    // Cargar Aplicaciones (ID = 9)
    this.comboService.getAplicaciones().subscribe({
      next: (data) => {
        this.aplicaciones = data;
        this.asignarColoresAplicaciones(data);  // ✅ NUEVO: Asignar colores
        console.log('✅ Aplicaciones cargadas:', data);
        console.log('🎨 Colores de aplicaciones asignados');
      },
      error: (error) => {
        console.error('❌ Error al cargar aplicaciones:', error);
      }
    });

    // Cargar TODOS los Módulos (ID = 11)
    this.comboService.getModulos().subscribe({
      next: (data) => {
        this.modulosCompletos = data;  // ✅ Guardar TODOS los módulos
        this.modulos = [];             // Inicialmente vacío (se filtrará al seleccionar aplicaciones)
        console.log('✅ Módulos completos cargados:', data.length, 'módulos');
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos:', error);
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

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.loading = false;
        this.usuarios = usuarios;
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
      IdAplicacion: [],  // Arrays vacíos para multiselects
      IdModulo: []       // Arrays vacíos para multiselects
    });
    
    // ✅ En modo NUEVO, Usuario y Contraseña son REQUERIDOS
    this.usuarioForm.get('sUsuario')?.setValidators([Validators.required, Validators.maxLength(50)]);
    this.usuarioForm.get('sClave')?.setValidators([Validators.required, Validators.maxLength(100)]);
    this.usuarioForm.get('sUsuario')?.updateValueAndValidity();
    this.usuarioForm.get('sClave')?.updateValueAndValidity();
    
    // ✅ Limpiar módulos disponibles (no mostrar módulos sin aplicaciones seleccionadas)
    this.modulos = [];
    
    this.mostrarModal = true;
    this.errorModal = '';
    this.successMessage = '';
    
    // ✅ FORZAR limpieza de los campos después de un pequeño delay
    setTimeout(() => {
      this.usuarioForm.get('sUsuario')?.setValue('');
      this.usuarioForm.get('sClave')?.setValue('');
    }, 0);
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
        
        // ✅ En modo EDICIÓN, Usuario y Contraseña son OPCIONALES
        this.usuarioForm.get('sUsuario')?.clearValidators();
        this.usuarioForm.get('sClave')?.clearValidators();
        this.usuarioForm.get('sUsuario')?.setValidators([Validators.maxLength(50)]);
        this.usuarioForm.get('sClave')?.setValidators([Validators.maxLength(100)]);
        this.usuarioForm.get('sUsuario')?.updateValueAndValidity();
        this.usuarioForm.get('sClave')?.updateValueAndValidity();
        
        this.usuarioForm.patchValue({
          sUsuario: '',  // ✅ VACÍO - Usuario decide si cambia
          sClave: '',    // ✅ VACÍO - Usuario decide si cambia
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
          IdAplicacion: usuarioCompleto.IdAplicacion ? String(usuarioCompleto.IdAplicacion).split(',').map(Number) : [],
          IdModulo: usuarioCompleto.IdModulo ? String(usuarioCompleto.IdModulo).split(',').map(Number) : [],
          sImpacto: this.convertirANumero(usuarioCompleto.sImpacto),
          sPrioridad: this.convertirANumero(usuarioCompleto.sPrioridad),
          sEstadoC: this.convertirANumero(usuarioCompleto.sEstadoC)
        });
        
        // ✅ NUEVO: Si hay aplicaciones seleccionadas, cargar sus módulos
        if (usuarioCompleto.IdAplicacion) {
          const idsAplicaciones = String(usuarioCompleto.IdAplicacion).split(',').map(Number);
          this.filtrarModulosPorAplicaciones(idsAplicaciones);
        }
        
        console.log('✅ Usuario cargado para edición:', usuarioCompleto);
        console.log('✅ Valores pre-seleccionados:', {
          TipoDocumento: usuarioCompleto.iID_DocumnetoI,
          Aplicaciones: usuarioCompleto.IdAplicacion,
          Modulos: usuarioCompleto.IdModulo,
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
      IdAplicacion: [],  // ✅ Limpiar multiselects
      IdModulo: []
    });
    this.modulos = [];  // ✅ Limpiar módulos disponibles
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
    
    const formValue = this.usuarioForm.value;

    // ✅ NUEVO: Si está en modo EDICIÓN y campos vacíos, usar valores originales
    const sUsuarioFinal = formValue.sUsuario || (this.modoEdicion && this.usuarioActual ? this.usuarioActual.sUsuario : '');
    const sClaveFinal = formValue.sClave || (this.modoEdicion && this.usuarioActual ? this.usuarioActual.Pass : '');

    const usuarioData = {
      sUsuario: sUsuarioFinal,
      sClave: sClaveFinal,
      sNombre: formValue.sNombre,
      ApePaterno: this.usuarioForm.value.ApePaterno,
      ApeMaterno: this.usuarioForm.value.ApeMaterno || '',
      IdPerfil: this.usuarioForm.value.IdPerfil,
      IdEmpresa: this.usuarioForm.value.IdEmpresa,
      IdSucursal: this.usuarioForm.value.IdSucursal,
      IdDocumento: this.usuarioForm.value.IdDocumento || null,
      sNumero: this.usuarioForm.value.sNumero,
      Correo: this.usuarioForm.value.Correo || '',
      sTelefono: this.usuarioForm.value.sTelefono || '',
      sDireccion: this.usuarioForm.value.sDireccion || '',
      sCargo: this.usuarioForm.value.sCargo || '',
      sImagen: this.usuarioForm.value.sImagen || '',
      workgroup1: this.usuarioForm.value.workgroup1 || '',
      workgroup2: this.usuarioForm.value.workgroup2 || '',
      workgroup3: this.usuarioForm.value.workgroup3 || '',
      workgroup4: this.usuarioForm.value.workgroup4 || '',
      workgroup5: this.usuarioForm.value.workgroup5 || '',
      workgroup6: this.usuarioForm.value.workgroup6 || '',
      workgroup7: this.usuarioForm.value.workgroup7 || '',
      workgroup8: this.usuarioForm.value.workgroup8 || '',
      workgroup9: this.usuarioForm.value.workgroup9 || '',
      workgroup10: this.usuarioForm.value.workgroup10 || '',
      IdAplicacion: this.convertirArrayAString(this.usuarioForm.value.IdAplicacion),
      IdModulo: this.convertirArrayAString(this.usuarioForm.value.IdModulo),
      sImpacto: this.usuarioForm.value.sImpacto || null,
      sPrioridad: this.usuarioForm.value.sPrioridad || null,
      sEstadoC: this.usuarioForm.value.sEstadoC || null,
      Usuario: usuario
    };

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
   * ✅ NUEVO: Configurar filtrado automático de módulos cuando cambian las aplicaciones
   */
  private configurarFiltroModulosPorAplicacion(): void {
    this.usuarioForm.get('IdAplicacion')?.valueChanges.subscribe((aplicacionesSeleccionadas: number[]) => {
      console.log('📱 Aplicaciones seleccionadas:', aplicacionesSeleccionadas);
      this.filtrarModulosPorAplicaciones(aplicacionesSeleccionadas);
    });
  }

  /**
   * ✅ NUEVO: Filtrar módulos según las aplicaciones seleccionadas
   */
  private filtrarModulosPorAplicaciones(idsAplicaciones: number[]): void {
    // Si no hay aplicaciones seleccionadas, limpiar módulos
    if (!idsAplicaciones || idsAplicaciones.length === 0) {
      this.modulos = [];
      this.usuarioForm.patchValue({ IdModulo: [] }, { emitEvent: false });
      console.log('⚠️ No hay aplicaciones seleccionadas, módulos limpiados');
      return;
    }

    // Si no hay módulos completos cargados, esperar
    if (this.modulosCompletos.length === 0) {
      console.log('⏳ Esperando carga de módulos completos...');
      return;
    }

    // Filtrar módulos usando forkJoin para obtener módulos de cada aplicación
    const requests = idsAplicaciones.map(idAplicacion => 
      this.comboService.getModulosPorAplicacion(idAplicacion)
    );

    forkJoin(requests).subscribe({
      next: (resultados) => {
        // Combinar todos los resultados y eliminar duplicados
        const modulosUnicos = new Map<number, ComboItem>();
        
        // ✅ NUEVO: Guardar relación módulo → aplicación para colores
        const modulosPorAplicacion: { idAplicacion: number; modulos: ComboItem[] }[] = [];
        
        resultados.forEach((modulos, index) => {
          const idAplicacion = idsAplicaciones[index];
          modulosPorAplicacion.push({ idAplicacion, modulos });
          
          modulos.forEach(modulo => {
            modulosUnicos.set(modulo.Id, modulo);
          });
        });

        this.modulos = Array.from(modulosUnicos.values());
        
        // ✅ NUEVO: Asignar colores a los módulos según su aplicación
        this.asignarColoresModulos(modulosPorAplicacion);
        
        console.log('✅ Módulos filtrados:', this.modulos.length, 'de', this.modulosCompletos.length);
        console.log('📋 Aplicaciones:', idsAplicaciones);
        console.log('📦 Módulos disponibles:', this.modulos.map(m => `${m.Id}: ${m.Descripcion}`));

        // Limpiar módulos seleccionados que ya no están disponibles
        const modulosActuales = this.usuarioForm.get('IdModulo')?.value as number[] || [];
        const idsModulosDisponibles = this.modulos.map(m => m.Id);
        const modulosValidos = modulosActuales.filter(id => idsModulosDisponibles.includes(id));
        
        if (modulosActuales.length !== modulosValidos.length) {
          this.usuarioForm.patchValue({ IdModulo: modulosValidos }, { emitEvent: false });
          console.log('🔄 Módulos seleccionados filtrados:', modulosValidos);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar módulos por aplicación:', error);
        this.modulos = [];
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

  /**
   * ✅ NUEVO: Asignar a cada módulo el color de su aplicación padre
   */
  private asignarColoresModulos(modulosPorAplicacion: { idAplicacion: number; modulos: ComboItem[] }[]): void {
    this.coloresModulos.clear();
    
    modulosPorAplicacion.forEach(({ idAplicacion, modulos }) => {
      const colorAplicacion = this.coloresAplicaciones.get(idAplicacion);
      
      if (colorAplicacion) {
        modulos.forEach(modulo => {
          this.coloresModulos.set(modulo.Id, colorAplicacion);
          console.log(`  🎨 Módulo ${modulo.Id} (${modulo.Descripcion}) → ${colorAplicacion} (de app ${idAplicacion})`);
        });
      }
    });

    console.log('✅ Colores de módulos asignados:', this.coloresModulos.size, 'módulos');
  }

  /**
   * ✅ NUEVO: Obtener aplicaciones a partir de string de IDs
   * "1,2,4" → [{ id: 1, nombre: "Sistema Tickets" }, { id: 2, nombre: "ERP" }, ...]
   */
  obtenerAplicaciones(idsString: string): { id: number; nombre: string }[] {
    if (!idsString || idsString.trim() === '') {
      return [];
    }

    const ids = idsString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    
    return ids.map(id => {
      const aplicacion = this.aplicaciones.find(app => app.Id === id);
      return {
        id,
        nombre: aplicacion ? aplicacion.Descripcion : `App ${id}`
      };
    });
  }

  /**
   * ✅ NUEVO: Obtener módulos a partir de string de IDs
   * "10,15,20" → [{ id: 10, nombre: "Tickets" }, { id: 15, nombre: "Usuarios" }, ...]
   */
  obtenerModulos(idsString: string): { id: number; nombre: string }[] {
    if (!idsString || idsString.trim() === '') {
      return [];
    }

    const ids = idsString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    
    return ids.map(id => {
      const modulo = this.modulosCompletos.find(mod => mod.Id === id);
      return {
        id,
        nombre: modulo ? modulo.Descripcion : `Mod ${id}`
      };
    });
  }

  /**
   * ✅ NUEVO: Obtener color de una aplicación
   */
  obtenerColorAplicacion(id: number): string {
    return this.coloresAplicaciones.get(id) || '#6b7280'; // gris por defecto
  }

  /**
   * ✅ NUEVO: Obtener color de un módulo (hereda del color de su aplicación)
   */
  obtenerColorModulo(id: number): string {
    // Buscar el módulo para obtener su aplicación padre
    const modulo = this.modulosCompletos.find(m => m.Id === id);
    if (modulo) {
      // Buscar en el servicio de combos para obtener la aplicación del módulo
      // Por ahora, usar un color por defecto
      return this.coloresModulos.get(id) || '#6b7280'; // gris por defecto
    }
    return '#6b7280';
  }
}
