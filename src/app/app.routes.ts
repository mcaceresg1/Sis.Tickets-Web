import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ============================================
  // RUTA DE LOGIN (sin autenticación)
  // ============================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ============================================
  // LAYOUT PRINCIPAL (Header + Menu + Content)
  // ============================================
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // ============================================
      // RUTAS SEGÚN PROCEDIMIENTO GEN_MenuPorUsuario
      // ============================================

      // MENU DEL SISTEMA > Tickets
      // BD: Controlador='Gestion', Vista='Tickets' → /gestion/Tickets
      {
        path: 'gestion/Tickets',
        loadComponent: () => import('./pages/gestion/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
      },
      {
        path: 'gestion/tickets',
        redirectTo: 'gestion/Tickets',
        pathMatch: 'full'
      },
      {
        path: 'gestion/tickets/new',
        loadComponent: () => import('./pages/gestion/tickets/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
      },
      {
        path: 'gestion/tickets/:id',
        loadComponent: () => import('./pages/gestion/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
      },
      {
        path: 'gestion/tickets/update/:id',
        loadComponent: () => import('./pages/gestion/tickets/ticket-update/ticket-update.component').then(m => m.TicketUpdateComponent)
      },

      // CONFIGURACION APP > Usuario (LUsuario)
      // BD: Controlador='Mantenimiento', Vista='LUsuario' → /mantenimiento/LUsuario
      {
        path: 'mantenimiento/LUsuario',
        loadComponent: () => import('./pages/mantenimiento/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },

      // CONFIGURACION APP > Perfil (Perfiles)
      // BD: Controlador='Seguridad', Vista='Perfiles' → /seguridad/Perfiles
      {
        path: 'seguridad/Perfiles',
        loadComponent: () => import('./pages/seguridad/perfiles/perfiles.component').then(m => m.PerfilesComponent)
      },

      // CONFIGURACION APP > Sistemas
      // BD: Controlador='Mantenimiento', Vista='Sistemas' → /mantenimiento/Sistemas
      {
        path: 'mantenimiento/Sistemas',
        loadComponent: () => import('./pages/mantenimiento/sistemas/sistemas.component').then(m => m.SistemasComponent)
      },

      // CONFIGURACION APP > Módulos
      // BD: Controlador='Mantenimiento', Vista='Modulos' → /mantenimiento/Modulos
      {
        path: 'mantenimiento/Modulos',
        loadComponent: () => import('./pages/mantenimiento/modulos/modulos.component').then(m => m.ModulosComponent)
      },

      // CONFIGURACION APP > Páginas
      // BD: Controlador='Mantenimiento', Vista='Paginas' → /mantenimiento/Paginas
      {
        path: 'mantenimiento/Paginas',
        loadComponent: () => import('./pages/mantenimiento/paginas/paginas.component').then(m => m.PaginasComponent)
      },

      // CONFIGURACION APP > Empresas
      // BD: Controlador='Mantenimiento', Vista='Empresa' → /mantenimiento/Empresa
      {
        path: 'mantenimiento/Empresa',
        loadComponent: () => import('./pages/mantenimiento/empresas/empresas.component').then(m => m.EmpresasComponent)
      },

      // CONFIGURACION APP > Sucursales
      // BD: Controlador='Mantenimiento', Vista='Sucursal' → /mantenimiento/Sucursal
      {
        path: 'mantenimiento/Sucursal',
        loadComponent: () => import('./pages/mantenimiento/sucursales/sucursales.component').then(m => m.SucursalesComponent)
      },

      // CONFIGURACION APP > Tipo Empresa
      // BD: Controlador='Mantenimiento', Vista='TipoEmpresa' → /mantenimiento/TipoEmpresa
      {
        path: 'mantenimiento/TipoEmpresa',
        loadComponent: () => import('./pages/mantenimiento/tipo-empresa/tipo-empresa.component').then(m => m.TipoEmpresaComponent)
      },

      // CONFIGURACION APP > Pais
      // BD: Controlador='Mantenimiento', Vista='Pais' → /mantenimiento/Pais
      {
        path: 'mantenimiento/Pais',
        loadComponent: () => import('./pages/mantenimiento/pais/pais.component').then(m => m.PaisComponent)
      },

      // CONFIGURACION APP > Asignación Menú a Perfil
      // BD: Controlador='Seguridad', Vista='MenuPerfil' → /seguridad/MenuPerfil
      {
        path: 'seguridad/MenuPerfil',
        loadComponent: () => import('./pages/mantenimiento/menu-perfil/menu-perfil.component').then(m => m.MenuPerfilComponent)
      },

      // CONFIGURACION TKs > Prioridad (Urgencia)
      // BD: Controlador='Mantenimiento', Vista='Urgencia' → /mantenimiento/Urgencia
      {
        path: 'mantenimiento/Urgencia',
        loadComponent: () => import('./pages/mantenimiento/prioridad/prioridad.component').then(m => m.PrioridadComponent)
      },

      // CONFIGURACION TKs > Estado
      // BD: Controlador='Mantenimiento', Vista='Estado' → /mantenimiento/Estado
      {
        path: 'mantenimiento/Estado',
        loadComponent: () => import('./pages/mantenimiento/estado/estado.component').then(m => m.EstadoComponent)
      },

      // CONFIGURACION TKs > Impacto (Inpacto)
      // BD: Controlador='Mantenimiento', Vista='Inpacto' → /mantenimiento/Inpacto
      {
        path: 'mantenimiento/Inpacto',
        loadComponent: () => import('./pages/mantenimiento/impacto/impacto.component').then(m => m.ImpactoComponent)
      },

      // ============================================
      // RUTAS DE COMPATIBILIDAD (opcional)
      // ============================================
      {
        path: 'tickets',
        redirectTo: 'gestion/tickets',
        pathMatch: 'full'
      },
      {
        path: 'mantenimiento',
        loadComponent: () => import('./features/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent)
      }
    ]
  },

  // ============================================
  // RUTA POR DEFECTO (404 o rutas no encontradas)
  // ============================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

