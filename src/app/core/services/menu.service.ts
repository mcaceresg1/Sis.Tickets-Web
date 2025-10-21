import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem, MenuResponse } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$ = this.menuItemsSubject.asObservable();

  /**
   * Obtiene el menú por usuario desde el procedimiento almacenado
   * El idPerfil se obtiene automáticamente del token JWT
   */
  getMenuPorUsuario(): Observable<MenuResponse> {
    return this.http.get<MenuResponse>(`${environment.apiUrl}/menu`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const hierarchicalMenu = this.buildMenuHierarchy(response.data);
            this.menuItemsSubject.next(hierarchicalMenu);
          }
        })
      );
  }

  /**
   * Construye la jerarquía del menú a partir de los datos planos
   * @param items Lista plana de items del menú
   */
  private buildMenuHierarchy(items: MenuItem[]): MenuItem[] {
    const itemsMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    // Primero, crear un mapa de todos los items
    // IMPORTANTE: Todos los menús comienzan COLAPSADOS (expanded: false)
    items.forEach(item => {
      itemsMap.set(item.IdMenu, { 
        ...item, 
        subItems: [], 
        expanded: false  // 🔒 Siempre comienza colapsado
      });
    });

    // Luego, construir la jerarquía
    items.forEach(item => {
      const menuItem = itemsMap.get(item.IdMenu);
      if (menuItem) {
        if (item.IdPadre === null) {
          // Es un item raíz
          rootItems.push(menuItem);
        } else {
          // Es un sub-item, agregarlo al padre
          const parent = itemsMap.get(item.IdPadre);
          if (parent && parent.subItems) {
            parent.subItems.push(menuItem);
          }
        }
      }
    });

    // Ordenar por el campo Orden
    this.sortMenuItems(rootItems);
    
    console.log('📋 Menú construido - Total items raíz:', rootItems.length);
    rootItems.forEach(item => {
      console.log(`  ├─ ${item.Menu}: ${item.subItems?.length || 0} sub-items, expanded=${item.expanded}`);
    });
    
    return rootItems;
  }

  /**
   * Ordena recursivamente los items del menú y sus sub-items
   * @param items Items a ordenar
   */
  private sortMenuItems(items: MenuItem[]): void {
    items.sort((a, b) => a.Orden - b.Orden);
    items.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        this.sortMenuItems(item.subItems);
      }
    });
  }

  /**
   * Verifica si un item es una cabecera (sin acción)
   * @param item Item del menú
   */
  isHeader(item: MenuItem): boolean {
    return item.Vista === '##' || item.Controlador === '##';
  }

  /**
   * Obtiene la ruta del item del menú
   * @param item Item del menú
   */
  getRoute(item: MenuItem): string {
    if (this.isHeader(item)) {
      return '';
    }
    
    // Construir la ruta basada en Vista y Controlador
    // Convertir controlador a minúsculas, pero mantener el case de Vista
    const controller = item.Controlador.toLowerCase();
    const vista = item.Vista; // Mantener case original para Vista
    
    return `/${controller}/${vista}`;
  }

  /**
   * Limpia el menú al cerrar sesión
   */
  clearMenu(): void {
    this.menuItemsSubject.next([]);
  }

  /**
   * Obtiene el menú actual del BehaviorSubject
   */
  getCurrentMenu(): MenuItem[] {
    return this.menuItemsSubject.value;
  }
}

