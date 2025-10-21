import { Component, Input, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComboItem } from '../../../core/models/combo.model';

@Component({
  selector: 'app-multi-select-tags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select-tags.component.html',
  styleUrls: ['./multi-select-tags.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectTagsComponent),
      multi: true
    }
  ]
})
export class MultiSelectTagsComponent implements ControlValueAccessor {
  @Input() items: ComboItem[] = [];
  @Input() placeholder: string = 'Seleccione opciones';
  @Input() label: string = '';
  @Input() colorMap: Map<number, string> = new Map();
  @ViewChild('selectField') selectFieldRef?: ElementRef;

  selectedIds: number[] = [];
  mostrarDropdown = false;
  disabled = false;
  dropdownPosition = { top: '0px', left: '0px', width: '0px' };

  private onChange: any = () => {};
  private onTouched: any = () => {};

  // Paleta de colores predefinidos
  private readonly defaultColors = [
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

  // ✅ MODIFICADO: Obtener color con prioridad al mapa personalizado
  getColor(id: number): string {
    // Si hay un color personalizado en el mapa, usarlo
    if (this.colorMap && this.colorMap.has(id)) {
      return this.colorMap.get(id)!;
    }
    // Si no, usar el color por defecto basado en ID
    return this.defaultColors[id % this.defaultColors.length];
  }

  toggleDropdown(event?: Event): void {
    console.log('📂 toggleDropdown llamado');
    console.log('🔒 Disabled:', this.disabled);
    console.log('📋 Items disponibles:', this.items.length);
    console.log('📊 Items:', this.items);
    
    if (!this.disabled) {
      this.mostrarDropdown = !this.mostrarDropdown;
      console.log('✅ Dropdown visible:', this.mostrarDropdown);
      
      // Calcular posición del dropdown cuando se abre
      if (this.mostrarDropdown && event) {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        
        this.dropdownPosition = {
          top: `${rect.bottom + window.scrollY + 8}px`,
          left: `${rect.left + window.scrollX}px`,
          width: `${rect.width}px`
        };
        
        console.log('📍 Posición dropdown:', this.dropdownPosition);
      }
    } else {
      console.log('⚠️ Dropdown deshabilitado');
    }
  }

  cerrarDropdown(): void {
    this.mostrarDropdown = false;
    this.onTouched();
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleItem(id: number): void {
    console.log('🖱️ toggleItem llamado con ID:', id);
    console.log('🔒 Disabled:', this.disabled);
    console.log('📋 Items actuales:', this.items.length);
    console.log('✅ IDs seleccionados antes:', this.selectedIds);
    
    if (this.disabled) {
      console.log('⚠️ Componente deshabilitado, no se puede seleccionar');
      return;
    }

    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      // Deseleccionar
      this.selectedIds = this.selectedIds.filter(itemId => itemId !== id);
      console.log('❌ Item deseleccionado:', id);
    } else {
      // Seleccionar
      this.selectedIds = [...this.selectedIds, id];
      console.log('✅ Item seleccionado:', id);
    }
    
    console.log('📋 IDs seleccionados después:', this.selectedIds);
    this.onChange(this.selectedIds);
    console.log('🔄 onChange llamado con:', this.selectedIds);
  }

  removeItem(id: number, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    
    this.selectedIds = this.selectedIds.filter(itemId => itemId !== id);
    this.onChange(this.selectedIds);
  }

  getSelectedItems(): ComboItem[] {
    return this.items.filter(item => this.selectedIds.includes(item.Id));
  }

  // ControlValueAccessor implementation
  writeValue(value: number[] | string): void {
    console.log('📝 writeValue llamado con:', value, 'tipo:', typeof value);
    
    if (typeof value === 'string') {
      // Convertir "1,2,3" a [1,2,3]
      this.selectedIds = value ? value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [];
    } else if (Array.isArray(value)) {
      this.selectedIds = value || [];
    } else {
      this.selectedIds = [];
    }
    
    console.log('✅ selectedIds asignados:', this.selectedIds);
    console.log('📦 Items seleccionados:', this.getSelectedItems().map(i => i.Descripcion));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

