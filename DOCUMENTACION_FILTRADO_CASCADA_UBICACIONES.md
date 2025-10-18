# 🗺️ Sistema de Filtrado en Cascada de Ubicaciones

## 📋 Descripción

Sistema completo de selección de ubicaciones geográficas con **filtrado automático en cascada**:

```
País → Departamento → Provincia → Distrito
```

---

## 🎯 Cómo Funciona

### Flujo de Selección:

```
1. Usuario selecciona PAÍS
   ↓
   ✅ Se cargan DEPARTAMENTOS de ese país
   
2. Usuario selecciona DEPARTAMENTO
   ↓
   ✅ Se cargan PROVINCIAS de ese departamento
   
3. Usuario selecciona PROVINCIA
   ↓
   ✅ Se cargan DISTRITOS de esa provincia
   
4. Usuario selecciona DISTRITO
   ↓
   ✅ Formulario completo
```

---

## 📊 Ejemplo Visual en el Modal

```
┌────────────────────────────────────────────────┐
│ Nueva Sucursal                              [×]│
├────────────────────────────────────────────────┤
│                                                │
│ Código *          Empresa *                   │
│ [001____]         [Seleccione...        ▼]    │
│                                                │
│ Tipo Empresa *    País *                      │
│ [Seleccione...▼]  [Perú                 ▼]    │ ← 1. Selecciono País
│                                                │
│ Departamento *    Provincia *    Distrito *   │
│ [Lima       ▼]    [Seleccione... ▼] [...]     │ ← 2. Aparecen departamentos
│   • Lima                                       │
│   • Callao                                     │
│   • Arequipa                                   │
│   • Cusco                                      │
│                                                │
└────────────────────────────────────────────────┘

Después de seleccionar Departamento "Lima":

┌────────────────────────────────────────────────┐
│ Departamento *    Provincia *    Distrito *   │
│ [Lima       ▼]    [Lima         ▼]  [...]     │ ← 3. Aparecen provincias
│                     • Lima                     │
│                     • Barranca                 │
│                     • Cajatambo                │
│                     • Canta                    │
│                     • Cañete                   │
└────────────────────────────────────────────────┘

Después de seleccionar Provincia "Lima":

┌────────────────────────────────────────────────┐
│ Departamento *    Provincia *    Distrito *   │
│ [Lima       ▼]    [Lima     ▼]  [Miraflores▼] │ ← 4. Aparecen distritos
│                                   • Miraflores │
│                                   • San Isidro │
│                                   • Surco      │
│                                   • Barranco   │
│                                   • San Borja  │
└────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Backend (API)

#### 1. **Procedimientos Almacenados Creados:**

```sql
-- 1. GEN_ListaDepartamentos
--    Entrada: @IdPais
--    Salida: Departamentos donde sIdProv='00' y sIdDistrito='00'

-- 2. GEN_ListaProvincias
--    Entrada: @IdPais, @IdDepartamento
--    Salida: Provincias donde sIdProv<>'00' y sIdDistrito='00'

-- 3. GEN_ListaDistritos
--    Entrada: @IdPais, @IdDepartamento, @IdProvincia
--    Salida: Distritos donde sIdDistrito<>'00'
```

#### 2. **Endpoints REST:**

```
GET /api/ubigeo/departamentos/:idPais
GET /api/ubigeo/provincias/:idPais/:idDepartamento
GET /api/ubigeo/distritos/:idPais/:idDepartamento/:idProvincia
```

#### 3. **Arquitectura Completa:**

```
┌─────────────────┐
│   Controller    │  UbigeoController.ts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Use Cases     │  GetDepartamentos.usecase.ts
│                 │  GetProvincias.usecase.ts
│                 │  GetDistritos.usecase.ts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  UbigeoRepository.ts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  GEN_Ubigeo (tabla)
│                 │  GEN_ListaDepartamentos (SP)
│                 │  GEN_ListaProvincias (SP)
│                 │  GEN_ListaDistritos (SP)
└─────────────────┘
```

---

### Frontend (Angular)

#### 1. **Servicio de Ubigeo:**

```typescript
// ubigeo.service.ts
getDepartamentosPorPais(idPais: string): Observable<UbigeoItem[]>
getProvinciasPorDepartamento(idPais, idDepartamento): Observable<UbigeoItem[]>
getDistritosPorProvincia(idPais, idDepartamento, idProvincia): Observable<UbigeoItem[]>
```

#### 2. **Filtrado en Cascada (Listeners):**

```typescript
// sucursales.component.ts
configurarFiltradoCascada(): void {
  // 1. Listener de País
  this.sucursalForm.get('IdPais')?.valueChanges.subscribe(idPais => {
    // Limpiar departamentos, provincias y distritos
    // Cargar departamentos del país seleccionado
  });
  
  // 2. Listener de Departamento
  this.sucursalForm.get('IdDepartamento')?.valueChanges.subscribe(idDep => {
    // Limpiar provincias y distritos
    // Cargar provincias del departamento seleccionado
  });
  
  // 3. Listener de Provincia
  this.sucursalForm.get('IdProvincia')?.valueChanges.subscribe(idProv => {
    // Limpiar distritos
    // Cargar distritos de la provincia seleccionada
  });
}
```

#### 3. **HTML con Selects Deshabilitados:**

```html
<!-- Departamento: Deshabilitado hasta que se seleccione país -->
<select formControlName="IdDepartamento" [disabled]="departamentos.length === 0">
  <option value="">Seleccione primero un país...</option>
  <option *ngFor="let depto of departamentos" [value]="depto.sIdDep">
    {{ depto.sDescUbigeo }}
  </option>
</select>

<!-- Provincia: Deshabilitado hasta que se seleccione departamento -->
<select formControlName="IdProvincia" [disabled]="provincias.length === 0">
  <option value="">Seleccione primero un departamento...</option>
  <option *ngFor="let prov of provincias" [value]="prov.sIdProv">
    {{ prov.sDescUbigeo }}
  </option>
</select>

<!-- Distrito: Deshabilitado hasta que se seleccione provincia -->
<select formControlName="IdDistrito" [disabled]="distritos.length === 0">
  <option value="">Seleccione primero una provincia...</option>
  <option *ngFor="let dist of distritos" [value]="dist.sIdDistrito">
    {{ dist.sDescUbigeo }}
  </option>
</select>
```

---

## 🗄️ Tabla GEN_Ubigeo - Estructura de Datos

### Formato de IDs:

```sql
-- Nivel: PAÍS
sIdPais = '02', sIdDep = '00', sIdProv = '00', sIdDistrito = '00'
sDescUbigeo = 'PERÚ'

-- Nivel: DEPARTAMENTO
sIdPais = '02', sIdDep = '15', sIdProv = '00', sIdDistrito = '00'
sDescUbigeo = 'LIMA'

-- Nivel: PROVINCIA
sIdPais = '02', sIdDep = '15', sIdProv = '01', sIdDistrito = '00'
sDescUbigeo = 'LIMA'

-- Nivel: DISTRITO
sIdPais = '02', sIdDep = '15', sIdProv = '01', sIdDistrito = '18'
sDescUbigeo = 'MIRAFLORES'
```

### Reglas de Identificación:

| Nivel | sIdDep | sIdProv | sIdDistrito |
|-------|--------|---------|-------------|
| País | '00' | '00' | '00' |
| Departamento | ≠'00' | '00' | '00' |
| Provincia | ≠'00' | ≠'00' | '00' |
| Distrito | ≠'00' | ≠'00' | ≠'00' |

---

## 🚀 Instrucciones de Uso

### Paso 1: Ejecutar Scripts SQL

```sql
-- 1. Ejecutar en SQL Server Management Studio:
--    C:\WS_Tickets_ver\Sis.Tickets-Api\CREAR_PROCEDIMIENTOS_UBIGEO.sql

-- Este script:
-- ✅ Crea los 3 procedimientos almacenados
-- ✅ Hace pruebas automáticas
-- ✅ Muestra datos de ejemplo
-- ✅ Verifica la tabla GEN_Ubigeo
```

### Paso 2: Compilar Backend

```bash
cd C:\WS_Tickets_ver\Sis.Tickets-Api
npm run build

# O reiniciar el servidor si está en modo watch
```

### Paso 3: Reiniciar Frontend

```bash
cd C:\WS_Tickets_ver\Sis.Tickets-Web
# Detener (Ctrl+C) y volver a iniciar
ng serve

# O si está configurado con npm:
npm start
```

### Paso 4: Probar

1. Ir a `Mantenimiento > Sucursales`
2. Click en "Nueva Sucursal"
3. Seleccionar un **Tipo Empresa**
4. Seleccionar un **País** → Deberían aparecer los departamentos
5. Seleccionar un **Departamento** → Deberían aparecer las provincias
6. Seleccionar una **Provincia** → Deberían aparecer los distritos
7. Seleccionar un **Distrito**
8. Llenar los demás campos y guardar

---

## 📂 Archivos Creados/Modificados

### Backend (Sis.Tickets-Api):

```
✅ NUEVOS:
src/domain/repositories/
└── IUbigeoRepository.ts

src/infrastructure/repositories/
└── UbigeoRepository.ts

src/application/use-cases/ubigeo/
├── GetDepartamentos.usecase.ts
├── GetProvincias.usecase.ts
└── GetDistritos.usecase.ts

src/adapters/controllers/
└── UbigeoController.ts

src/adapters/routes/
└── ubigeo.routes.ts

CREAR_PROCEDIMIENTOS_UBIGEO.sql

✏️ MODIFICADOS:
src/shared/container/DependencyContainer.ts
src/app.ts
```

### Frontend (Sis.Tickets-Web):

```
✅ NUEVOS:
src/app/core/services/
└── ubigeo.service.ts

✏️ MODIFICADOS:
src/app/pages/mantenimiento/sucursales/
├── sucursales.component.ts       (+ filtrado cascada)
└── sucursales.component.html     (+ selects cascada)

📚 DOCUMENTACIÓN:
DOCUMENTACION_FILTRADO_CASCADA_UBICACIONES.md
```

---

## 🔍 Diagrama de Flujo Completo

```
USUARIO ABRE MODAL "NUEVA SUCURSAL"
         │
         ▼
┌────────────────────────┐
│ Seleccionar País       │
│ [Perú            ▼]    │
└────────┬───────────────┘
         │
         │ onChange → IdPais = '02'
         ▼
┌────────────────────────────────────────────┐
│ Frontend: this.cargarDepartamentos('02')   │
│           GET /api/ubigeo/departamentos/02 │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Backend: GEN_ListaDepartamentos @IdPais='02'│
│          SELECT * FROM GEN_Ubigeo          │
│          WHERE sIdPais='02'                │
│          AND sIdProv='00'                  │
│          AND sIdDistrito='00'              │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Frontend recibe:                           │
│ [                                          │
│   { sIdDep: '15', sDescUbigeo: 'LIMA' },  │
│   { sIdDep: '07', sDescUbigeo: 'CALLAO' },│
│   { sIdDep: '04', sDescUbigeo: 'AREQUIPA'}│
│ ]                                          │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Dropdown habilitado:   │
│ [Lima            ▼]    │
│   • Lima               │
│   • Callao             │
│   • Arequipa           │
└────────┬───────────────┘
         │
         │ Usuario selecciona "Lima" (15)
         ▼
┌────────────────────────────────────────────┐
│ Frontend: this.cargarProvincias('02','15') │
│           GET /api/ubigeo/provincias/02/15 │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Backend: GEN_ListaProvincias               │
│          @IdPais='02', @IdDep='15'         │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Frontend recibe provincias de Lima:        │
│ [                                          │
│   { sIdProv: '01', sDescUbigeo: 'LIMA' }, │
│   { sIdProv: '02', sDescUbigeo: 'BARRANCA'}│
│ ]                                          │
└────────┬───────────────────────────────────┘
         │
         │ Usuario selecciona "Lima" (01)
         ▼
┌────────────────────────────────────────────┐
│ Frontend: this.cargarDistritos('02','15','01')│
│           GET /api/ubigeo/distritos/02/15/01  │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Backend: GEN_ListaDistritos                │
│          @IdPais='02', @IdDep='15',        │
│          @IdProv='01'                      │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Frontend recibe distritos de Lima:         │
│ [                                          │
│   { sIdDistrito: '18', sDesc: 'MIRAFLORES'}│
│   { sIdDistrito: '32', sDesc: 'SAN ISIDRO'}│
│   { sIdDistrito: '41', sDesc: 'SURCO' }   │
│ ]                                          │
└────────────────────────────────────────────┘
```

---

## 🎨 Estados de los Combos

### Estado 1: Inicial
```
País:          [Seleccione...        ▼] ✅ Habilitado
Departamento:  [Seleccione país...   ▼] ❌ Deshabilitado (vacío)
Provincia:     [Seleccione depto...  ▼] ❌ Deshabilitado (vacío)
Distrito:      [Seleccione prov...   ▼] ❌ Deshabilitado (vacío)
```

### Estado 2: País Seleccionado
```
País:          [Perú                 ▼] ✅ Habilitado
Departamento:  [Seleccione...        ▼] ✅ Habilitado (con opciones)
Provincia:     [Seleccione depto...  ▼] ❌ Deshabilitado (vacío)
Distrito:      [Seleccione prov...   ▼] ❌ Deshabilitado (vacío)
```

### Estado 3: Departamento Seleccionado
```
País:          [Perú                 ▼] ✅ Habilitado
Departamento:  [Lima                 ▼] ✅ Habilitado
Provincia:     [Seleccione...        ▼] ✅ Habilitado (con opciones)
Distrito:      [Seleccione prov...   ▼] ❌ Deshabilitado (vacío)
```

### Estado 4: Provincia Seleccionada
```
País:          [Perú                 ▼] ✅ Habilitado
Departamento:  [Lima                 ▼] ✅ Habilitado
Provincia:     [Lima                 ▼] ✅ Habilitado
Distrito:      [Seleccione...        ▼] ✅ Habilitado (con opciones)
```

### Estado 5: Completo
```
País:          [Perú                 ▼] ✅ Habilitado
Departamento:  [Lima                 ▼] ✅ Habilitado
Provincia:     [Lima                 ▼] ✅ Habilitado
Distrito:      [Miraflores           ▼] ✅ Habilitado
```

---

## 🧪 Pruebas

### Prueba 1: Crear Nueva Sucursal

1. Click en "Nueva Sucursal"
2. Llenar campos básicos
3. **Tipo Empresa:** Seleccionar "Matriz"
4. **País:** Seleccionar "Perú" → Ver departamentos aparecer
5. **Departamento:** Seleccionar "Lima" → Ver provincias aparecer
6. **Provincia:** Seleccionar "Lima" → Ver distritos aparecer
7. **Distrito:** Seleccionar "Miraflores"
8. Guardar

### Prueba 2: Cambiar País a mitad de selección

1. Seleccionar País: "Perú"
2. Seleccionar Departamento: "Lima"
3. Seleccionar Provincia: "Lima"
4. **Cambiar País** a "Chile"
5. ✅ Departamentos, Provincias y Distritos se limpian automáticamente
6. Se muestran los departamentos de Chile

---

## 🐛 Troubleshooting

### Problema: Los combos están vacíos

**Causa:** Los procedimientos SQL no existen

**Solución:**
```sql
-- Ejecutar: CREAR_PROCEDIMIENTOS_UBIGEO.sql
```

---

### Problema: Departamentos no aparecen al seleccionar país

**Causa:** El IdPais en la base de datos no coincide

**Solución:**
```sql
-- Verificar IDs de países:
SELECT DISTINCT sIdPais, sDescUbigeo
FROM GEN_Ubigeo
WHERE sIdDep = '00' AND sIdProv = '00' AND sIdDistrito = '00'

-- Ajustar el combo de países para usar estos IDs
```

---

### Problema: Error 404 en requests de ubigeo

**Causa:** Las rutas no están registradas

**Solución:**
```typescript
// Verificar en app.ts que esté:
apiRouter.use('/ubigeo', createUbigeoRoutes(ubigeoController));

// Reiniciar el servidor backend
```

---

## 📝 Notas Importantes

1. **IDs son strings:** Los IDs de ubigeo son VARCHAR, no INT
2. **'00' significa no aplica:** 
   - Departamento = '00' → Es un país
   - Provincia = '00' → Es un departamento
   - Distrito = '00' → Es una provincia
3. **Limpieza automática:** Al cambiar un nivel, se limpian los niveles inferiores
4. **Edición funciona:** Al editar, se cargan en cascada todos los niveles

---

## ✅ Resumen

### Flujo Completo:

```
Usuario                Frontend               Backend              Database
   │                       │                      │                    │
   ├─ Selecciona País ────→│                      │                    │
   │                       ├─ GET /departamentos/02→                   │
   │                       │                      ├─ EXEC GEN_ListaDepartamentos
   │                       │←──── Departamentos ─┤                    │
   ├─ Ve opciones ←────────│                      │                    │
   │                       │                      │                    │
   ├─ Selecciona Depto ───→│                      │                    │
   │                       ├─ GET /provincias/02/15→                   │
   │                       │                      ├─ EXEC GEN_ListaProvincias
   │                       │←───── Provincias ───┤                    │
   ├─ Ve opciones ←────────│                      │                    │
   │                       │                      │                    │
   ├─ Selecciona Prov ────→│                      │                    │
   │                       ├─ GET /distritos/02/15/01→                 │
   │                       │                      ├─ EXEC GEN_ListaDistritos
   │                       │←────── Distritos ───┤                    │
   ├─ Ve opciones ←────────│                      │                    │
   │                       │                      │                    │
   ├─ Selecciona Distrito→│                      │                    │
   ├─ Click "Guardar" ────→│                      │                    │
   │                       ├─ POST /sucursales ──→│                    │
   │                       │                      ├─ EXEC GEN_InsSucursal
   │                       │←──── Success ────────┤                    │
   ├─ Sucursal creada ←────│                      │                    │
```

---

**¡Sistema de filtrado en cascada completo e implementado!** 🎉


