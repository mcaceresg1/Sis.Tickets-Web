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
      {
        path: 'gestion/tickets',
        loadComponent: () => import('./pages/gestion/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
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
      {
        path: 'mantenimiento/lusuario',
        loadComponent: () => import('./pages/mantenimiento/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },

      // CONFIGURACION APP > Perfil (Perfiles)
      {
        path: 'seguridad/perfiles',
        loadComponent: () => import('./pages/seguridad/perfiles/perfiles.component').then(m => m.PerfilesComponent)
      },

      // CONFIGURACION APP > Aplicaciones
      {
        path: 'mantenimiento/aplicacion',
        loadComponent: () => import('./pages/mantenimiento/aplicaciones/aplicaciones.component').then(m => m.AplicacionesComponent)
      },

      // CONFIGURACION APP > Modulos
      {
        path: 'mantenimiento/modulos',
        loadComponent: () => import('./pages/mantenimiento/modulos/modulos.component').then(m => m.ModulosComponent)
      },

      // CONFIGURACION APP > Empresas
      {
        path: 'mantenimiento/empresa',
        loadComponent: () => import('./pages/mantenimiento/empresas/empresas.component').then(m => m.EmpresasComponent)
      },

      // CONFIGURACION APP > Sucursales
      {
        path: 'mantenimiento/sucursal',
        loadComponent: () => import('./pages/mantenimiento/sucursales/sucursales.component').then(m => m.SucursalesComponent)
      },

      // CONFIGURACION APP > Tipo Empresa
      {
        path: 'mantenimiento/tipoempresa',
        loadComponent: () => import('./pages/mantenimiento/tipo-empresa/tipo-empresa.component').then(m => m.TipoEmpresaComponent)
      },

      // CONFIGURACION APP > Pais
      {
        path: 'mantenimiento/pais',
        loadComponent: () => import('./pages/mantenimiento/pais/pais.component').then(m => m.PaisComponent)
      },

      // CONFIGURACION TKs > Prioridad (Urgencia)
      {
        path: 'mantenimiento/urgencia',
        loadComponent: () => import('./pages/mantenimiento/prioridad/prioridad.component').then(m => m.PrioridadComponent)
      },

      // CONFIGURACION TKs > Estado
      {
        path: 'mantenimiento/estado',
        loadComponent: () => import('./pages/mantenimiento/estado/estado.component').then(m => m.EstadoComponent)
      },

      // CONFIGURACION TKs > Impacto (Inpacto)
      {
        path: 'mantenimiento/inpacto',
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

