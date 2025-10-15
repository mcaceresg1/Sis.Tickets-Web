# Frontend - SIS.Tickets (Angular)

Aplicación frontend del Sistema de Gestión de Tickets desarrollada en Angular 17+.

## 📋 Descripción

Aplicación web moderna y responsiva construida con Angular standalone components, que consume la API REST del backend para gestionar tickets empresariales.

## 🛠️ Tecnologías

- **Angular 17+** - Framework frontend
- **TypeScript 5.2+** - Lenguaje de programación
- **RxJS 7.8** - Programación reactiva
- **Angular Material** - Componentes UI
- **Bootstrap 5** - Framework CSS
- **SCSS** - Preprocesador CSS

## 📁 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Núcleo de la aplicación
│   │   │   ├── guards/              # Guards de rutas
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/        # Interceptores HTTP
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/              # Modelos de datos
│   │   │   │   ├── usuario.model.ts
│   │   │   │   ├── ticket.model.ts
│   │   │   │   └── catalogo.model.ts
│   │   │   └── services/            # Servicios
│   │   │       ├── auth.service.ts
│   │   │       ├── ticket.service.ts
│   │   │       └── catalogo.service.ts
│   │   │
│   │   ├── features/                # Módulos de características
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   │   ├── ticket-list/
│   │   │   │   ├── ticket-form/
│   │   │   │   └── ticket-detail/
│   │   │   └── mantenimiento/
│   │   │
│   │   ├── app.component.ts         # Componente raíz
│   │   ├── app.config.ts            # Configuración de la app
│   │   └── app.routes.ts            # Rutas de la aplicación
│   │
│   ├── environments/                # Configuraciones por ambiente
│   │   ├── environment.ts           # Desarrollo
│   │   └── environment.prod.ts      # Producción
│   │
│   ├── assets/                      # Recursos estáticos
│   ├── styles.scss                  # Estilos globales
│   ├── index.html                   # HTML principal
│   └── main.ts                      # Punto de entrada
│
├── angular.json                     # Configuración de Angular
├── package.json                     # Dependencias npm
├── tsconfig.json                    # Configuración de TypeScript
└── README.md                        # Este archivo
```

## ⚙️ Requisitos Previos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Angular CLI**: 17.x o superior

### Instalar Angular CLI

```bash
npm install -g @angular/cli@17
```

## 🚀 Instalación

1. **Navegar a la carpeta del Frontend**

```bash
cd Frontend
```

2. **Instalar dependencias**

```bash
npm install
```

## 💻 Desarrollo

### Ejecutar en modo desarrollo

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

### Ejecutar con un puerto específico

```bash
ng serve --port 4300
```

### Ejecutar con recarga automática

```bash
npm run watch
```

## 🏗️ Compilación

### Build de desarrollo

```bash
npm run build
```

### Build de producción

```bash
npm run build:prod
# o
ng build --configuration production
```

Los archivos compilados se generarán en `dist/sis-tickets-frontend/`

## 🧪 Testing

```bash
npm test
# o
ng test
```

## 📝 Configuración

### Configurar URL de la API

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

Para producción, editar `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourserver.com/api'
};
```

## 🎯 Características Principales

### Autenticación

- Login de usuarios
- Guard para rutas protegidas
- Interceptor HTTP para tokens
- Gestión de sesión en localStorage

### Dashboard

- Vista principal con accesos rápidos
- Información del usuario autenticado
- Navegación a módulos principales

### Gestión de Tickets

- Listar tickets con filtros
- Ver detalle de ticket
- Crear nuevo ticket
- Actualizar ticket
- Agregar comentarios

### Mantenimiento

- Gestión de catálogos
- Aplicaciones
- Empresas
- Módulos
- Parámetros del sistema

## 🔐 Seguridad

- Rutas protegidas con `authGuard`
- Interceptor para agregar tokens a requests
- Validación de sesión en cada navegación
- Logout automático en caso de sesión inválida

## 🎨 Estilos y UI

- **Bootstrap 5** para layout responsivo
- **Angular Material** para componentes UI
- **SCSS** para estilos personalizados
- **Material Icons** para iconografía

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm start              # Servidor de desarrollo
npm run watch          # Build con watch mode

# Producción
npm run build          # Build de desarrollo
npm run build:prod     # Build de producción

# Testing
npm test               # Ejecutar tests
npm run lint           # Linter
```

## 🌐 Rutas de la Aplicación

```
/login                 # Página de inicio de sesión
/dashboard             # Dashboard principal (protegida)
/tickets               # Lista de tickets (protegida)
/tickets/new           # Crear nuevo ticket (protegida)
/tickets/:id           # Detalle de ticket (protegida)
/mantenimiento         # Mantenimiento (protegida)
```

## 📱 Responsive Design

La aplicación está optimizada para:

- Desktop (1920x1080 y superiores)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667 y superiores)

## 🐛 Troubleshooting

### Error: Cannot find module '@angular/...'

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de compilación de TypeScript

```bash
npm install typescript@~5.2.2 --save-dev
```

### Puerto 4200 en uso

```bash
ng serve --port 4300
```

## 📚 Recursos

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Bootstrap 5](https://getbootstrap.com/)
- [RxJS](https://rxjs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crear una nueva branch para tu feature
2. Realizar cambios y commits
3. Crear un Pull Request

## 📄 Licencia

Copyright © 2025 - Sistema de Tickets

---

**Desarrollado con ❤️ usando Angular**

