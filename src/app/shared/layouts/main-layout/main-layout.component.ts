import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { Usuario } from '../../../core/models/usuario.model';
import { MenuItem } from '../../../core/models/menu.model';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  currentUser: Usuario | null = null;
  menuItems: MenuItem[] = [];
  currentRoute: string = '';
  isLoadingMenu = true;
  menuCollapsed = false; // false = expandido, true = contraído

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMenu();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Suscribe a los cambios de ruta para actualizar el menú activo
   */
  private subscribeToRouteChanges(): void {
    // Detectar ruta inicial
    this.currentRoute = this.router.url;
    this.updateActiveMenuItems();

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      this.updateActiveMenuItems();
    });
  }

  /**
   * Actualiza los items del menú marcando el activo y expandiendo padres
   */
  private updateActiveMenuItems(): void {
    if (this.menuItems.length === 0) return;

    // Limpiar estados previos
    this.clearActiveStates(this.menuItems);

    // Buscar y marcar el item activo
    this.markActiveItem(this.menuItems);
  }

  /**
   * Limpia el estado activo de todos los items
   */
  private clearActiveStates(items: MenuItem[]): void {
    items.forEach(item => {
      item.isActive = false;
      if (item.subItems && item.subItems.length > 0) {
        this.clearActiveStates(item.subItems);
      }
    });
  }

  /**
   * Marca el item activo basado en la ruta actual
   */
  private markActiveItem(items: MenuItem[], parentItem?: MenuItem): boolean {
    for (const item of items) {
      const route = this.menuService.getRoute(item);
      
      // Verificar si es el item activo
      if (route && this.isRouteActive(route)) {
        item.isActive = true;
        
        // Expandir el padre si existe
        if (parentItem) {
          parentItem.expanded = true;
        }
        
        return true;
      }

      // Buscar recursivamente en sub-items
      if (item.subItems && item.subItems.length > 0) {
        const foundInChildren = this.markActiveItem(item.subItems, item);
        if (foundInChildren) {
          // Si se encontró en los hijos, expandir este item
          item.expanded = true;
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Verifica si una ruta coincide con la ruta actual
   */
  private isRouteActive(route: string): boolean {
    // Normalizar rutas (eliminar / inicial y final)
    const normalizedRoute = route.replace(/^\/|\/$/g, '');
    const normalizedCurrentRoute = this.currentRoute.replace(/^\/|\/$/g, '');

    // Coincidencia exacta
    if (normalizedCurrentRoute === normalizedRoute) {
      return true;
    }

    // Verificar si la ruta actual es una sub-ruta (para rutas como /tickets/new o /tickets/123)
    if (normalizedCurrentRoute.startsWith(normalizedRoute + '/')) {
      return true;
    }

    return false;
  }

  /**
   * Carga el menú dinámico del usuario
   */
  loadMenu(): void {
    if (!this.currentUser || !this.currentUser.nombre) {
      console.error('No hay usuario logueado');
      this.isLoadingMenu = false;
      return;
    }

    this.menuService.getMenuPorUsuario(this.currentUser.nombre).subscribe({
      next: (response) => {
        if (response.success) {
          // ⚠️ IMPORTANTE: Obtener la jerarquía procesada desde el servicio
          // NO usar response.data directamente porque son datos planos del backend
          this.menuItems = this.menuService.getCurrentMenu();
          
          console.log('✅ Menú cargado (jerarquía):', this.menuItems);
          console.log('📊 Total items raíz:', this.menuItems.length);
          this.menuItems.forEach(item => {
            console.log(`  ├─ ${item.Menu} (${item.IdMenu}): ${item.subItems?.length || 0} sub-items, expanded: ${item.expanded}`);
            if (item.subItems && item.subItems.length > 0) {
              item.subItems.forEach(subItem => {
                console.log(`     └─ ${subItem.Menu} (${subItem.IdMenu})`);
              });
            }
          });

          // Actualizar el menú activo después de cargar
          this.updateActiveMenuItems();
        }
        this.isLoadingMenu = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar menú:', error);
        this.isLoadingMenu = false;
      }
    });
  }

  /**
   * Verifica si un item es una cabecera (no tiene acción)
   */
  isHeader(item: MenuItem): boolean {
    return this.menuService.isHeader(item);
  }

  /**
   * Alterna el estado expandido/colapsado de un item
   */
  toggleMenuItem(item: MenuItem): void {
    if (item.subItems && item.subItems.length > 0) {
      // Colapsar otros items del mismo nivel (opcional - comportamiento accordion)
      // this.collapseOtherItems(item);
      
      item.expanded = !item.expanded;
      console.log(`🔄 Toggle ${item.Menu}: expanded = ${item.expanded}, subItems count = ${item.subItems.length}`);
    } else {
      console.log(`⚠️ Item ${item.Menu} no tiene subItems para toggle`);
    }
  }

  /**
   * Navega a la ruta del item seleccionado
   */
  navigateToMenuItem(item: MenuItem, event?: Event): void {
    console.log('🖱️ Click en menu item:', item.Menu, 'Has subItems:', item.subItems?.length || 0, 'expanded:', item.expanded);
    
    // Detener propagación para evitar clicks múltiples
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Si el item tiene sub-items (cabecera o contenedor), expandir/colapsar
    if (item.subItems && item.subItems.length > 0) {
      this.toggleMenuItem(item);
      return;
    }

    // Si es cabecera sin sub-items, no hacer nada
    if (this.isHeader(item)) {
      console.log('📁 Es cabecera sin sub-items, no hacer nada');
      return;
    }

    // Si es un item normal (sin sub-items), navegar
    const route = this.menuService.getRoute(item);
    if (route) {
      console.log('🚀 Navegando a:', route);
      this.router.navigate([route]);
      // No es necesario marcar manualmente como activo, el sistema de detección automática lo hará
    }
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Navega al dashboard al hacer clic en el logo
   */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Alterna el menú colapsado/expandido
   */
  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.menuService.clearMenu();
    this.authService.logout();
  }
}
