# Flujo de Nueva Membresía y Patrón Estrategia — Documentación Técnica

## Índice

1. [Flujo de Nueva Membresía](#1-flujo-de-nueva-membresía)
2. [Patrón Estrategia aplicado al Método de Pago](#2-patrón-estrategia-aplicado-al-método-de-pago)
3. [Estructura de archivos del patrón](#3-estructura-de-archivos-del-patrón)
4. [¿Dónde se activa el patrón en el código?](#4-dónde-se-activa-el-patrón-en-el-código)

---

## 1. Flujo de Nueva Membresía

**Archivo principal:** `src/app/dashboard/membresias/nueva/page.tsx`

La pantalla de creación de membresía está organizada en 4 pasos secuenciales que el operador completa de forma guiada.

---

### 1.1 Carga inicial — `useEffect` al montar la página

Cuando el componente se renderiza por primera vez, se disparan dos llamadas a la API en paralelo:

```
GET /actividades       → carga todas las actividades disponibles
GET /pagos/metodos     → carga los métodos de pago activos
```

Estos datos se almacenan en el estado local del componente y se usan para poblar las opciones del formulario. Si alguna falla, se muestra un mensaje de error en pantalla.

---

### 1.2 Validación del formulario — Esquema Zod

Antes de que cualquier dato llegue a la API, se define un esquema de validación con **Zod** conectado a `react-hook-form` mediante `zodResolver`.

Las reglas definidas son:

| Campo | Regla |
|---|---|
| `idSocio` | Número mayor a 0 (socio seleccionado) |
| `fechaInicio` | No puede ser anterior al día actual |
| `fechaFin` | Debe ser posterior a `fechaInicio` |
| `actividadesIds` | Array con al menos 1 actividad |
| `idMetodoPago` | Número mayor a 0 (método seleccionado) |

Si alguna regla falla al hacer submit, Zod emite el mensaje de error correspondiente directamente debajo del campo afectado, sin enviar ninguna petición al servidor.

---

### 1.3 Paso 1 — Selección del socio

El operador escribe nombre, DNI o número de socio y presiona "Buscar". Esto llama a:

```
GET /socios?search=<texto>&estaActivo=true
```

Los resultados aparecen en una lista desplegable. Al hacer clic en un socio:

- Se guarda el objeto `Socio` en `socioSeleccionado` (estado local).
- Se registra el `id` en el formulario mediante `setValue('idSocio', socio.id)`.
- La lista desaparece y se muestra una tarjeta verde con los datos del socio seleccionado.

El botón **Crear Membresía** permanece deshabilitado mientras no haya un socio seleccionado.

---

### 1.4 Paso 2 — Período de la membresía

El operador selecciona la fecha de inicio y la fecha de fin. Cada vez que cambia alguna:

- El estado local `fechaInicio` / `fechaFin` se actualiza.
- Zod valida que la fecha de inicio no sea pasada y que la fecha de fin sea posterior.
- Se activa el cálculo automático del monto (ver sección 1.5).

---

### 1.5 Paso 3 — Selección de actividades y cálculo del monto

Cada actividad es un card clickeable con checkbox. Al hacer clic se ejecuta `toggleActividad()`, que:

1. Agrega o quita el ID de la actividad del array `selectedActividades`.
2. Sincroniza el array con el formulario usando `setValue('actividadesIds', newSelected)`.

El monto total se calcula en tiempo real con estas operaciones:

```
cantidadMeses   = diferencia en meses entre fechaInicio y fechaFin
precioTotal/mes = suma de precios de actividades seleccionadas
montoTotal      = precioTotal/mes × cantidadMeses
```

Este valor se pone automáticamente en el campo "Monto a Pagar", pero el operador puede modificarlo manualmente para registrar un **pago parcial**. Si lo modifica, el sistema muestra el saldo pendiente que quedará tras el pago.

---

### 1.6 Paso 4 — Método de pago

El operador selecciona el método de pago desde un `<select>` cargado con los métodos activos.

---

### 1.7 Envío del formulario — `onSubmit`

Al hacer clic en "Crear Membresía", `handleSubmit` de react-hook-form ejecuta primero las validaciones de Zod. Si todo es correcto, llama a `onSubmit` con los datos ya validados.

Dentro de `onSubmit` se:

1. Verifica que haya un usuario autenticado leyendo del `localStorage`.
2. Construye el DTO con todos los datos:

```typescript
{
  idSocio,
  fechaInicio,
  fechaFin,
  idsActividades,     // IDs de las actividades seleccionadas
  costoTotal,         // precio calculado automáticamente
  monto,              // lo que el socio abona en este momento
  idMetodoPago,
  idUsuarioProcesa    // ID del usuario logueado (operador)
}
```

3. Llama al servicio:

```
POST /membresias   → body: CrearMembresiaDto
```

**Si el backend responde con éxito:** se muestra el banner verde "¡Membresía creada exitosamente!" y el formulario se resetea completamente para poder registrar otra membresía sin recargar la página.

**Si el backend devuelve un error:** se muestra el mensaje de error del servidor en el banner rojo.

---

### Diagrama del flujo completo

```
[Página carga]
      │
      ├── GET /actividades
      └── GET /pagos/metodos
            │
      [Paso 1] Buscar socio → GET /socios?search=...
            │
      [Paso 2] Seleccionar fechaInicio y fechaFin
            │
      [Paso 3] Seleccionar actividades → cálculo local del monto
            │
      [Paso 4] Seleccionar método de pago
            │
      [Submit] → Zod valida → onSubmit()
            │
      POST /membresias  (JWT en header Authorization)
            │
      ┌─────┴──────┐
      ✅ Éxito      ❌ Error
   Banner verde   Banner rojo
   Reset form     Muestra mensaje
```

---

## 2. Patrón Estrategia aplicado al Método de Pago

### ¿Qué problema resuelve?

Sin el patrón, el formulario de pago necesitaría un bloque de `if/else` o `switch` dentro del JSX para mostrar distintos componentes según el método de pago seleccionado. Eso genera código acoplado: cada vez que se agrega un nuevo método de pago, hay que modificar el formulario.

**El Patrón Estrategia desacopla el comportamiento de visualización del formulario que lo consume.**

---

### ¿Por qué es un patrón de comportamiento?

Los patrones de comportamiento definen cómo los objetos interactúan y se comportan en tiempo de ejecución. En este caso, el comportamiento que varía es **cómo se presenta la UI de cobro**: no cambia qué se paga, ni cuánto, ni a quién — cambia **cómo** se muestra la interfaz dependiendo del método elegido.

---

### Estructura del patrón

#### Interfaz común — `PagoStrategy`

**Archivo:** `src/lib/pagos/PagoStrategy.ts`

```typescript
import type { ReactNode } from 'react';

export interface PagoStrategy {
  renderUI(monto: number): ReactNode;
}
```

Define el contrato que todas las estrategias deben cumplir: reciben el monto y devuelven un elemento de React. El formulario solo conoce esta interfaz, nunca las implementaciones concretas.

---

#### Estrategia 1 — `EfectivoStrategy`

**Archivo:** `src/lib/pagos/strategies/EfectivoStrategy.tsx`

Muestra un mensaje recordando al operador que debe recibir el dinero en mano del socio antes de confirmar. No tiene campos adicionales.

```
┌─────────────────────────────────────────────┐
│ 💵 Pago en efectivo                         │
│ Asegurate de recibir $1.500,00 en mano del  │
│ socio antes de confirmar.                   │
└─────────────────────────────────────────────┘
```

---

#### Estrategia 2 — `TarjetaStrategy`

**Archivo:** `src/lib/pagos/strategies/TarjetaStrategy.tsx`

Renderiza un formulario completo con:
- Número de tarjeta (con formato automático `0000 0000 0000 0000`)
- Detección automática de red (Visa / Mastercard según el primer dígito)
- Monto total (campo de solo lectura)
- Nombre y apellido del titular
- Fecha de vencimiento (mes y año en selects separados)
- Código de seguridad (campo enmascarado)
- DNI del pagador (opcional)

```
┌─────────────────────────────────────────────┐
│ 💳 Datos de la tarjeta                      │
│ Número: [ 4444 1111 2222 3333    VISA ]      │
│ Total: $ 1.500,00                            │
│ Nombre: [ JUAN PEREZ                      ]  │
│ Venc: [MM] / [AA]    CVV: [ ••• ]           │
│ DNI (opcional): [ 12345678 ]                 │
└─────────────────────────────────────────────┘
```

---

#### Estrategia 3 — `TransferenciaStrategy`

**Archivo:** `src/lib/pagos/strategies/TransferenciaStrategy.tsx`

Genera dinámicamente un código QR con los datos del club (alias, CBU y monto) usando un servicio externo de generación de QR. Muestra junto al QR el alias, el CBU y el monto a transferir.

```
┌─────────────────────────────────────────────┐
│ 📱 Transferencia bancaria                   │
│                                             │
│  [QR]   Alias: CLUB.DEPORTIVO.ALIAS         │
│         CBU:   0000003100012345678901        │
│         Monto: $ 1.500,00                   │
└─────────────────────────────────────────────┘
```

---

#### La fábrica — `PagoStrategyFactory`

**Archivo:** `src/lib/pagos/PagoStrategyFactory.ts`

Recibe el nombre del método de pago como string y devuelve la estrategia correcta. El formulario nunca instancia estrategias directamente: siempre pasa por la fábrica.

```typescript
export function getPagoStrategy(nombreMetodo: string): PagoStrategy {
  const nombre = nombreMetodo.toLowerCase();

  if (nombre.includes('transferencia')) return transferenciaStrategy;
  if (nombre.includes('tarjeta') || nombre.includes('débito') ||
      nombre.includes('debito') || nombre.includes('crédito') ||
      nombre.includes('credito'))   return tarjetaStrategy;

  return efectivoStrategy; // comportamiento por defecto
}
```

La lógica es tolerante: si el nombre del método de pago en la base de datos es "Débito", "Crédito", "Tarjeta Visa", etc., todos caen en `TarjetaStrategy`. Si no coincide con ningún caso, el fallback es `EfectivoStrategy`.

---

## 3. Estructura de archivos del patrón

```
src/lib/pagos/
│
├── PagoStrategy.ts            ← Interfaz común (el contrato)
├── PagoStrategyFactory.ts     ← Fábrica que elige la estrategia correcta
│
└── strategies/
    ├── EfectivoStrategy.tsx   ← Estrategia: pago en efectivo
    ├── TarjetaStrategy.tsx    ← Estrategia: pago con tarjeta
    └── TransferenciaStrategy.tsx ← Estrategia: transferencia bancaria
```

---

## 4. ¿Dónde se activa el patrón en el código?

**Archivo:** `src/app/dashboard/pagos/nuevo/page.tsx` — línea 512

```tsx
// Cuando el usuario cambia el método de pago en el select,
// se guarda el nombre del método en el estado:
onChange: (e) => {
  const seleccionado = metodosPago.find(m => m.id === Number(e.target.value));
  setMetodoPagoNombre(seleccionado?.nombre ?? '');
}

// Y en el JSX, la estrategia se resuelve y renderiza en tiempo real:
{metodoPagoNombre && (
  <div className="mt-3">
    {getPagoStrategy(metodoPagoNombre).renderUI(montoIngresado || 0)}
  </div>
)}
```

### ¿Qué pasa en tiempo de ejecución?

1. El operador selecciona "Transferencia" en el `<select>`.
2. El `onChange` guarda `"Transferencia"` en `metodoPagoNombre`.
3. React re-renderiza el componente.
4. `getPagoStrategy("Transferencia")` devuelve `transferenciaStrategy`.
5. Se llama a `.renderUI(monto)` que retorna el JSX del QR con alias y CBU.
6. Ese JSX se muestra debajo del select, sin que el formulario sepa nada sobre cómo funciona la transferencia.

Si mañana se agrega un método de pago nuevo (por ejemplo, "Mercado Pago"), basta con:
1. Crear `MercadoPagoStrategy.tsx` implementando `PagoStrategy`.
2. Agregar un `if` en `PagoStrategyFactory.ts`.
3. El formulario no se modifica.

---

### Tabla comparativa de comportamientos

| Método seleccionado | Estrategia devuelta | UI renderizada |
|---|---|---|
| "Efectivo" | `EfectivoStrategy` | Mensaje de confirmación de recepción en mano |
| "Tarjeta" / "Débito" / "Crédito" | `TarjetaStrategy` | Formulario con número, vencimiento y CVV |
| "Transferencia" | `TransferenciaStrategy` | QR + alias + CBU del club |
| Cualquier otro | `EfectivoStrategy` (fallback) | Mensaje de confirmación de recepción en mano |
