# Mensajes del Sistema — Frontend Gestión Socios Club

Referencia completa de mensajes de éxito, error y validación para cada funcionalidad del sistema.

---

## Índice

1. [Autenticación (Login)](#1-autenticación-login)
2. [Perfil de Usuario](#2-perfil-de-usuario)
3. [Socios](#3-socios)
4. [Pagos](#4-pagos)
5. [Membresías](#5-membresías)
6. [Actividades](#6-actividades)
7. [Asistencias](#7-asistencias)
8. [Usuarios](#8-usuarios)
9. [Roles](#9-roles)
10. [Configuración — Auditoría](#10-configuración--auditoría)
11. [Configuración — Backup](#11-configuración--backup)

---

## 1. Autenticación (Login)

**Archivo:** `src/app/login/page.tsx`

| Operación | Tipo      | Mensaje |
|-----------|-----------|---------|
| Login     | Error     | `Error al iniciar sesión` |
| Login     | Validación | `El nombre de usuario es requerido` |
| Login     | Validación | `La contraseña es requerida` |

---

## 2. Perfil de Usuario

**Archivo:** `src/app/dashboard/perfil/page.tsx`

| Operación         | Tipo      | Mensaje |
|-------------------|-----------|---------|
| Cargar perfil     | Error     | `Error al cargar los datos del perfil` |
| Actualizar perfil | Éxito     | `Perfil actualizado exitosamente` |
| Actualizar perfil | Error     | `Error al actualizar el perfil` |
| Nombre            | Validación | `El nombre es requerido` |
| Nombre            | Validación | `El nombre no puede exceder 50 caracteres` |
| Nombre            | Validación | `El nombre solo puede contener letras` |
| Apellido          | Validación | `El apellido es requerido` |
| Apellido          | Validación | `El apellido no puede exceder 50 caracteres` |
| Apellido          | Validación | `El apellido solo puede contener letras` |
| Email             | Validación | `Email inválido` |
| Email             | Validación | `El email no puede exceder 100 caracteres` |
| DNI               | Validación | `El DNI es requerido` |
| DNI               | Validación | `El DNI solo puede contener números` |
| DNI               | Validación | `El DNI debe tener al menos 7 dígitos` |
| DNI               | Validación | `El DNI no puede exceder 8 dígitos` |
| Fecha nacimiento  | Validación | `La fecha de nacimiento es requerida` |
| Fecha nacimiento  | Validación | `La fecha de nacimiento debe ser anterior a hoy` |
| Contraseña        | Validación | `Debes ingresar tu contraseña actual para cambiarla` |
| Contraseña        | Validación | `Las contraseñas no coinciden` |
| Contraseña        | Validación | `La contraseña debe tener al menos 6 caracteres` |

---

## 3. Socios

**Archivos:**
- `src/app/dashboard/socios/page.tsx`
- `src/app/dashboard/socios/nuevo/page.tsx`
- `src/app/dashboard/socios/[id]/editar/page.tsx`

| Operación       | Tipo      | Mensaje |
|-----------------|-----------|---------|
| Crear socio     | Éxito     | `Socio {nombre} {apellido} creado exitosamente con número {numeroSocio}` |
| Crear socio     | Error     | `Error al crear el socio` |
| Editar socio    | Éxito     | `Socio actualizado exitosamente` |
| Editar socio    | Error     | `Error al actualizar el socio` |
| Editar socio    | Error     | `No se encontró el socio` |
| Listar socios   | Sin datos | `No se encontraron socios` |
| Nombre          | Validación | `El nombre debe tener al menos 2 caracteres` |
| Nombre          | Validación | `El nombre no puede exceder 50 caracteres` |
| Nombre          | Validación | `El nombre solo puede contener letras` |
| Apellido        | Validación | `El apellido debe tener al menos 2 caracteres` |
| Apellido        | Validación | `El apellido no puede exceder 50 caracteres` |
| Apellido        | Validación | `El apellido solo puede contener letras` |
| Email           | Validación | `Email inválido` |
| Email           | Validación | `El email no puede exceder 100 caracteres` |
| DNI             | Validación | `El DNI debe tener 7 u 8 dígitos` |
| Fecha nacimiento | Validación | `La fecha de nacimiento es requerida` |

---

## 4. Pagos

**Archivos:**
- `src/app/dashboard/pagos/page.tsx`
- `src/app/dashboard/pagos/nuevo/page.tsx`
- `src/app/dashboard/pagos/estadisticas/page.tsx`

| Operación              | Tipo      | Mensaje |
|------------------------|-----------|---------|
| Cargar datos iniciales | Error     | `Error al cargar los datos iniciales` |
| Buscar socios          | Validación | `Ingrese al menos 2 caracteres para buscar` |
| Buscar socios          | Sin datos | `No se encontraron socios con ese criterio de búsqueda` |
| Buscar socios          | Error     | `Error al buscar socios. Por favor, intenta de nuevo.` |
| Cargar membresías      | Sin pendientes | `¡Excelente! Este socio está al día con sus pagos y no tiene saldos pendientes` |
| Cargar membresías      | Error     | `Error al cargar las membresías del socio` |
| Registrar pago         | Éxito     | `¡Pago registrado exitosamente!` |
| Registrar pago         | Error     | `Error al registrar el pago` |
| Cargar comprobante     | Error     | `Error al cargar el comprobante` |
| Cargar comprobante     | Error     | `ID de pago inválido` |
| Socio                  | Validación | `Selecciona un socio` |
| Membresía              | Validación | `Selecciona una membresía` |
| Método de pago         | Validación | `Debes seleccionar el método de pago correspondiente` |
| Monto                  | Validación | `Ingresa el monto` |
| Monto                  | Validación | `El monto debe ser mayor a 0` |
| Monto                  | Validación | `El monto del pago no puede ser mayor al costo total de la membresía` |
| Fecha de pago          | Validación | `Debe ingresar la fecha de pago` |
| Fecha de pago          | Validación | `La fecha de pago no puede ser posterior a la fecha actual` |

---

## 5. Membresías

**Archivos:**
- `src/app/dashboard/membresias/page.tsx`
- `src/app/dashboard/membresias/nueva/page.tsx`
- `src/app/dashboard/membresias/[id]/editar/page.tsx`
- `src/app/dashboard/membresias/asignar-actividad/page.tsx`

| Operación               | Tipo      | Mensaje |
|-------------------------|-----------|---------|
| Crear membresía         | Éxito     | `¡Membresía creada exitosamente con el pago inicial registrado!` |
| Crear membresía         | Error     | `Error al crear la membresía` |
| Editar membresía        | Éxito     | `¡Membresía actualizada exitosamente!` |
| Editar membresía        | Error     | `Error al actualizar la membresía` |
| Editar membresía        | Error     | `ID de membresía inválido` |
| Eliminar membresía      | Confirmación | `¿Estás seguro de que deseas eliminar esta membresía? Esta acción no se puede deshacer.` |
| Eliminar membresía      | Error     | `Error al eliminar la membresía. Por favor, intenta nuevamente.` |
| Asignar actividad       | Éxito     | `Actividad asignada exitosamente` |
| Asignar actividad       | Error     | `Error al asignar la actividad` |
| Asignar actividad       | Validación | `Debe seleccionar una membresía primero` |
| Asignar actividad       | Validación | `Esta actividad ya está asignada a la membresía` |
| Quitar actividad        | Éxito     | `Actividad removida exitosamente` |
| Quitar actividad        | Error     | `Error al remover la actividad` |
| Cargar actividades      | Error     | `Error al cargar las actividades disponibles` |
| Cargar métodos de pago  | Error     | `Error al cargar los métodos de pago disponibles` |
| Cargar membresía        | Error     | `Error al cargar los datos de la membresía` |
| Listar membresías       | Sin datos | `No hay membresías registradas` |
| Listar membresías       | Sin resultados | `No se encontraron membresías que coincidan con la búsqueda` |
| Búsqueda de socio       | Validación | `Ingrese al menos 2 caracteres para buscar` |
| Búsqueda de socio       | Sin datos | `No se encontraron socios con ese criterio de búsqueda` |
| Socio                   | Validación | `Debe seleccionar un socio` |
| Fecha inicio            | Validación | `Debe ingresar la fecha de inicio` |
| Fecha inicio            | Validación | `La fecha de inicio no puede ser anterior a la fecha actual` |
| Fecha fin               | Validación | `Debe ingresar la fecha de fin` |
| Fecha fin               | Validación | `La fecha de fin debe ser posterior a la fecha de inicio` |
| Actividades             | Validación | `Debe seleccionar al menos una actividad` |
| Monto total             | Validación | `El monto total debe ser mayor a 0` |
| Monto pago              | Validación | `El monto del pago debe ser mayor a cero` |
| Monto pago              | Validación | `El monto del pago no puede ser mayor al costo total de la membresía` |
| Método de pago          | Validación | `Debe seleccionar un método de pago` |

---

## 6. Actividades

**Archivos:**
- `src/app/dashboard/actividades/page.tsx`
- `src/app/dashboard/actividades/nueva/page.tsx`
- `src/app/dashboard/actividades/[id]/editar/page.tsx`

| Operación          | Tipo      | Mensaje |
|--------------------|-----------|---------|
| Crear actividad    | Éxito     | `Actividad "{nombreActividad}" creada exitosamente con precio ${precio}` |
| Crear actividad    | Error     | `Error al crear la actividad` |
| Editar actividad   | Éxito     | `Actividad actualizada exitosamente` |
| Editar actividad   | Error     | `Error al actualizar la actividad` |
| Editar actividad   | Error     | `Error al cargar los datos de la actividad` |
| Eliminar actividad | Confirmación | `¿Estás seguro de que deseas eliminar la actividad "{nombre}"?` |
| Eliminar actividad | Error     | `Error al eliminar la actividad` |
| Cargar actividades | Error     | `Error al cargar las actividades` |
| Nombre             | Validación | `El nombre debe tener al menos 3 caracteres` |
| Nombre             | Validación | `El nombre no puede exceder 100 caracteres` |
| Descripción        | Validación | `La descripción no puede exceder 500 caracteres` |
| Precio             | Validación | `El precio es requerido` |
| Precio             | Validación | `El precio debe ser un número válido mayor o igual a 0` |

---

## 7. Asistencias

**Archivos:**
- `src/app/dashboard/asistencias/page.tsx`
- `src/app/dashboard/asistencias/marcar/page.tsx`

| Operación             | Tipo      | Mensaje |
|-----------------------|-----------|---------|
| Registrar asistencia  | Éxito     | `¡Asistencia registrada exitosamente!` |
| Registrar asistencia  | Error     | `Error al registrar la asistencia` |
| Verificar socio       | Error     | `Error al verificar el estado del socio` |
| Cargar asistencias    | Error     | `Error al cargar las asistencias` |
| Listar asistencias    | Sin datos | `No hay asistencias registradas` |
| Listar asistencias    | Sin resultados | `No se encontraron asistencias con ese criterio de búsqueda` |
| DNI                   | Validación | `Por favor ingrese un DNI` |

---

## 8. Usuarios

**Archivos:**
- `src/app/dashboard/usuarios/page.tsx`
- `src/app/dashboard/usuarios/nuevo/page.tsx`
- `src/app/dashboard/usuarios/[id]/editar/page.tsx`
- `src/app/dashboard/configuracion/usuarios/page.tsx`
- `src/app/dashboard/configuracion/usuarios/nuevo/page.tsx`
- `src/app/dashboard/configuracion/usuarios/[id]/editar/page.tsx`

| Operación           | Tipo      | Mensaje |
|---------------------|-----------|---------|
| Crear usuario       | Éxito     | `¡Usuario creado exitosamente!` |
| Crear usuario       | Error     | `Error al crear el usuario` |
| Editar usuario      | Éxito     | `¡Usuario actualizado exitosamente!` |
| Editar usuario      | Error     | `Error al actualizar el usuario` |
| Desactivar usuario  | Éxito     | `Usuario "{nombre}" desactivado exitosamente` |
| Desactivar usuario  | Error     | `Error al desactivar el usuario` |
| Cargar datos        | Error     | `Error al cargar los datos del usuario` |
| Cargar listado      | Error     | `Error al cargar los usuarios. Por favor, intenta de nuevo.` |
| Listar usuarios     | Sin datos | `No hay usuarios registrados` |

---

## 9. Roles

**Archivos:**
- `src/app/dashboard/roles/page.tsx`
- `src/app/dashboard/roles/nuevo/page.tsx`
- `src/app/dashboard/roles/[id]/editar/page.tsx`

| Operación    | Tipo      | Mensaje |
|--------------|-----------|---------|
| Crear rol    | Éxito     | `Rol "{nombre}" creado exitosamente` |
| Crear rol    | Error     | `Error al crear el rol` |
| Editar rol   | Éxito     | `Rol actualizado exitosamente` |
| Editar rol   | Error     | `Error al actualizar el rol` |
| Cargar rol   | Error     | `Error al cargar el rol` |
| Nombre       | Validación | `El nombre debe tener al menos 3 caracteres` |
| Nombre       | Validación | `El nombre no puede exceder 50 caracteres` |
| Nombre       | Validación | `Solo letras, números, guiones bajos y espacios` |

---

## 10. Configuración — Auditoría

**Archivo:** `src/app/dashboard/configuracion/auditoria/page.tsx`

| Operación         | Tipo      | Mensaje |
|-------------------|-----------|---------|
| Cargar auditoría  | Error (permisos) | `No tienes permisos para ver el registro de auditoría` |
| Cargar auditoría  | Error (sesión)   | `Sesión expirada` |
| Cargar auditoría  | Error     | `Error al cargar el registro de auditoría` |
| Cargar detalle    | Error     | `Error al cargar el detalle de la auditoría` |

---

## 11. Configuración — Backup

**Archivo:** `src/app/dashboard/configuracion/backup/page.tsx`

| Operación              | Tipo      | Mensaje |
|------------------------|-----------|---------|
| Cargar bases de datos  | Error (permisos) | `No tienes permisos para acceder a esta funcionalidad` |
| Cargar bases de datos  | Error (sesión)   | `Sesión expirada. Por favor inicia sesión nuevamente` |
| Cargar bases de datos  | Error     | `Error al cargar las bases de datos disponibles` |
| Cargar archivos        | Error (permisos) | `No tienes permisos para ver los archivos de backup` |
| Cargar archivos        | Error (sesión)   | `Sesión expirada` |
| Cargar archivos        | Error     | `Error al cargar la lista de archivos de backup` |
| Crear backup           | Éxito     | `✅ {mensaje}` + `⚠️ La aplicación se recargará para reflejar los cambios.` |
| Crear backup           | Error     | `❌ Error: {mensaje}` |
| Crear backup           | Error     | `Error al crear el backup. Por favor intenta nuevamente.` |
| Descargar backup       | Éxito     | `Descarga iniciada correctamente` |
| Descargar backup       | Error     | `Error al descargar el archivo. Por favor verifica que el archivo existe en el servidor.` |
| Restaurar backup       | Éxito     | `✅ {mensaje}` + `⚠️ La aplicación se recargará para reflejar los cambios.` |
| Restaurar backup       | Error     | `❌ {errorMessage}` |
| Restaurar backup       | Error     | `Error al restaurar el backup. Por favor verifica que el archivo existe y la base de datos está disponible.` |
| Copiar ruta            | Éxito     | `Ruta copiada al portapapeles` |

---

## Resumen

| Módulo          | Éxito | Error | Validación | Sin datos | Confirmación |
|-----------------|:-----:|:-----:|:----------:|:---------:|:------------:|
| Login           | —     | 1     | 2          | —         | —            |
| Perfil          | 1     | 2     | 14         | —         | —            |
| Socios          | 1     | 3     | 9          | 1         | —            |
| Pagos           | 1     | 4     | 8          | 2         | —            |
| Membresías      | 3     | 8     | 11         | 2         | 1            |
| Actividades     | 1     | 4     | 5          | —         | 1            |
| Asistencias     | 1     | 3     | 1          | 2         | —            |
| Usuarios        | 2     | 5     | —          | 1         | —            |
| Roles           | 2     | 3     | 3          | —         | —            |
| Auditoría       | —     | 4     | —          | —         | —            |
| Backup          | 3     | 6     | —          | —         | —            |
| **Total**       | **15**| **43**| **53**     | **8**     | **2**        |
