# ⚡ QUÉ HACER AHORA - Checklist Rápido

## 🎯 Tu Problema Actual

Seleccionas "PE PERU" pero no aparecen los departamentos.

**Causa:** El ID "PE" no coincide con el ID que usa la tabla `GEN_Ubigeo`.

---

## ✅ Solución en 3 Pasos (5 minutos)

### PASO 1: Ejecutar 2 Scripts SQL

```sql
-- 1️⃣ En SQL Server Management Studio:

-- Script 1 - Verificar IDs
Archivo: C:\WS_Tickets_ver\Sis.Tickets-Api\VERIFICAR_RELACION_PAIS_UBIGEO.sql

-- Script 2 - Crear procedimientos
Archivo: C:\WS_Tickets_ver\Sis.Tickets-Api\CREAR_PROCEDIMIENTOS_UBIGEO.sql
```

### PASO 2: Compilar y Reiniciar

```bash
# Backend
cd C:\WS_Tickets_ver\Sis.Tickets-Api
npm run build

# Frontend (detener con Ctrl+C si está corriendo, luego):
cd C:\WS_Tickets_ver\Sis.Tickets-Web
ng serve
```

### PASO 3: Probar con Consola Abierta

1. Abrir navegador: `http://localhost:4200`
2. **Abrir consola (F12)** ← MUY IMPORTANTE
3. Ir a `Mantenimiento > Sucursales > Nueva Sucursal`
4. Seleccionar "Perú"
5. **Ver en consola qué dice:**

```javascript
// Si funciona, verás:
✅ Departamentos cargados: 25 departamentos

// Si no funciona, verás:
❌ Error al cargar departamentos
```

---

## 🔧 Ya Implementé un Mapeo Temporal

El código YA tiene un mapeo que convierte automáticamente:

```
"PE" → "02"
"2"  → "02"
"CL" → "04"
"CO" → "06"
```

**Esto debería hacer que funcione** aunque el procedimiento SQL no esté corregido.

---

## 📊 Lo Que Deberías Ver

### En el Modal:

```
Tipo Empresa *    País *
[Matriz      ▼]   [PERU            ▼]

Departamento *    Provincia *    Distrito *
[LIMA        ▼]   [Seleccione... ▼] [Seleccione... ▼]
  • LIMA
  • CALLAO
  • AREQUIPA
  • CUSCO
```

### En la Consola del Navegador:

```
🌍 País seleccionado (original): PE
🔄 ID País mapeado: "PE" → "02"
🔄 Cargando departamentos para país: 02
📡 URL: http://localhost:3000/api/ubigeo/departamentos/02
✅ Departamentos cargados: 25 departamentos
📊 Datos: [...]
```

---

## 🚨 Si No Funciona

**Comparte en la consola del navegador:**
1. El mensaje de error completo
2. El ID del país que se está enviando
3. La respuesta del servidor

Y te ayudaré a ajustar el mapeo.

---

## 📂 Archivos Importantes

### Ejecutar primero:
1. `VERIFICAR_RELACION_PAIS_UBIGEO.sql` ← Te dice el ID correcto
2. `CREAR_PROCEDIMIENTOS_UBIGEO.sql` ← Crea los procedimientos

### Leer si necesitas más info:
- `INSTRUCCIONES_INMEDIATAS.md` ← Instrucciones detalladas
- `PASOS_CONFIGURAR_FILTRADO_CASCADA.md` ← Guía completa
- `DOCUMENTACION_FILTRADO_CASCADA_UBICACIONES.md` ← Documentación técnica

---

## 🎯 TL;DR (Muy Corto)

```bash
# 1. Ejecutar 2 scripts SQL
# 2. npm run build en backend
# 3. ng serve en frontend  
# 4. Probar con F12 abierto
# 5. Debería funcionar con el mapeo automático
```

**¡Prueba y avísame qué ves en la consola!** 🚀


