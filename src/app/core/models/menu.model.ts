export interface MenuItem {
  IdMenu: number;
  Menu: string;
  Orden: number;
  Vista: string;
  Controlador: string;
  IdPadre: number | null;
  sIcono: string | null;
  subItems?: MenuItem[]; // Para construir la jerarquía
  expanded?: boolean; // Para manejar el estado de expansión
  isActive?: boolean; // Para marcar el item activo basado en la ruta actual
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
  message?: string;
}

