import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { Usuario } from '../../../core/models/usuario.model';
import { MenuItem } from '../../../core/models/menu.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private router = inject(Router);
  
  currentUser: Usuario | null = null;
  menuItems: MenuItem[] = [];
  selectedMenu: string = '';
  isLoadingMenu = true;
  menuCollapsed = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMenu();
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
      this.selectedMenu = item.Menu;
      this.router.navigate([route]);
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
