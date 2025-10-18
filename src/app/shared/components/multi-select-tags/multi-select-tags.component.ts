import { Component, Input, forwardRef } from '@angular/core';
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
  @Input() colorMap: Map<number, string> = new Map();  // ✅ NUEVO: Mapa de colores personalizados

  selectedIds: number[] = [];
  mostrarDropdown = false;
  disabled = false;

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

  toggleDropdown(): void {
    if (!this.disabled) {
      this.mostrarDropdown = !this.mostrarDropdown;
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
    if (this.disabled) return;

    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds = this.selectedIds.filter(itemId => itemId !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
    }
    
    this.onChange(this.selectedIds);
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
    if (typeof value === 'string') {
      // Convertir "1,2,3" a [1,2,3]
      this.selectedIds = value ? value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [];
    } else if (Array.isArray(value)) {
      this.selectedIds = value || [];
    } else {
      this.selectedIds = [];
    }
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

