# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 frontend application for a club member management system ("Sistema de Gestión de Club"). It provides administrative tools for managing members (socios), memberships, payments, attendance, activities, users, and roles. The application uses the App Router with TypeScript and Tailwind CSS.

## Development Commands

```bash
# Development server (runs on default Next.js port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint
```

## Environment Configuration

The application connects to a backend API. Configure the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=https://localhost:49299/api
```

Default fallback: `http://localhost:5000/api` (see [next.config.js](next.config.js) and [src/lib/api/client.ts](src/lib/api/client.ts))

## Architecture

### Project Structure

- **`src/app/`** - Next.js App Router pages and layouts
  - Root: Login page and global layout
  - `/dashboard` - Main authenticated area with `AdminLayout` wrapper
  - `/dashboard/*` - Feature modules (socios, membresias, pagos, asistencias, actividades, usuarios, configuracion)

- **`src/lib/api/`** - API client and service layer
  - `client.ts` - Axios instance with JWT interceptors
  - Individual service files (`socios.ts`, `auth.ts`, `pagos.ts`, etc.)

- **`src/components/layout/`** - Layout components (AdminLayout, Sidebar, Header)

### API Client Architecture

All API communication goes through [src/lib/api/client.ts](src/lib/api/client.ts), which provides:

1. **Axios Instance** (`apiClient`) with base URL configuration
2. **Request Interceptor** - Automatically adds JWT bearer token from localStorage to all requests
3. **Response Interceptor** - Handles 401 errors by clearing auth state and redirecting to `/login`

Each domain has its own service file (e.g., `sociosService`, `authService`) that exports:
- TypeScript interfaces for DTOs and entities
- Service object with async methods that call the API
- All services use the shared `apiClient` instance

**Pattern for creating new API services:**
```typescript
import apiClient from './client';

export interface Entity { /* ... */ }
export interface CreateDto { /* ... */ }

export const entityService = {
  async obtenerTodos(): Promise<Entity[]> {
    const response = await apiClient.get<Entity[]>('/endpoint');
    return response.data;
  },
  // ... other CRUD methods
};
```

### Authentication Flow

1. User logs in via [src/app/login/page.tsx](src/app/login/page.tsx)
2. `authService.login()` receives JWT token and user object
3. Token and user stored in localStorage
4. All subsequent API requests include token via request interceptor
5. `AdminLayout` checks for user in localStorage, redirects to `/login` if missing
6. On 401 response, interceptor clears localStorage and redirects to `/login`

### Layout System

All `/dashboard` routes are wrapped by [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx), which applies `AdminLayout`:

- **AdminLayout** ([src/components/layout/AdminLayout.tsx](src/components/layout/AdminLayout.tsx))
  - Checks authentication (redirects if no user)
  - Renders `Sidebar` and `Header` components
  - Provides collapsible sidebar state management
  - Shows loading spinner during auth check

- **Sidebar** ([src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx))
  - Role-based menu filtering (superadmin, admin, recepcionista)
  - Collapsible navigation with expandable menu items
  - Active route highlighting
  - Menu structure defined in `menuItems` array with role restrictions

### Role-Based Access Control

The application has three user roles:
- **superadmin** - Full access to all features
- **admin** - Access to most features except system configuration
- **recepcionista** - Limited access (mainly attendance and viewing members)

Role filtering happens in:
1. `Sidebar` component - Filters menu items based on `usuario.rol` from localStorage
2. Individual pages may have additional checks (implementation varies)

**Important:** All roles are compared in lowercase (`usuario.rol.toLowerCase()`) to avoid case-sensitivity issues.

### TypeScript Path Aliases

Use `@/*` to import from `src/`:
```typescript
import { authService } from '@/lib/api/auth';
import AdminLayout from '@/components/layout/AdminLayout';
```

### Styling

- **Tailwind CSS** with custom configuration in [tailwind.config.js](tailwind.config.js)
- Utility-first approach with responsive design classes
- Color scheme: Blue primary, gray backgrounds, status colors (green/red)
- No custom CSS components - all styling is inline with Tailwind classes

### State Management

- **React Hooks** for local component state (`useState`, `useEffect`)
- **localStorage** for authentication persistence
- **@tanstack/react-query** available (v5.12.2) but not extensively used in current code
- **zustand** available (v4.4.7) but not extensively used in current code

### Form Handling

The project includes:
- **react-hook-form** (v7.48.2) for form state management
- **zod** (v3.22.4) with **@hookform/resolvers** for validation

Check existing form pages for patterns (e.g., [src/app/dashboard/socios/nuevo/page.tsx](src/app/dashboard/socios/nuevo/page.tsx)).

### Icons

Uses **lucide-react** (v0.294.0) for all icons. Import from `lucide-react`:
```typescript
import { Users, CreditCard, Calendar } from 'lucide-react';
```

### Date Handling

**date-fns** (v2.30.0) is available for date formatting and manipulation.

## Common Development Patterns

### Creating New Pages

1. Create page in `src/app/dashboard/[module]/page.tsx`
2. Use `'use client'` directive if using React hooks
3. Wrap with AdminLayout automatically via dashboard layout
4. Follow existing patterns for loading states, error handling, and data fetching

### Adding New API Services

1. Create new file in `src/lib/api/[entity].ts`
2. Define TypeScript interfaces for entity and DTOs
3. Export service object with methods using `apiClient`
4. Import in pages that need it

### Adding Menu Items

Edit `menuItems` array in [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx):
- Add `roles` array to restrict access
- Use `children` for submenu items
- Include appropriate icon from lucide-react

## Backend Integration

The backend API endpoints follow RESTful conventions:
- Base URL: Configured via `NEXT_PUBLIC_API_URL`
- Auth: JWT bearer tokens in Authorization header
- Standard CRUD: GET, POST, PUT, DELETE
- Common patterns: `/api/socios`, `/api/membresias`, `/api/pagos`, etc.

When the backend API URL changes, update `.env.local` and restart the dev server.

## Known Patterns

### Pagination
Services like `sociosService.obtenerTodos()` accept pagination parameters:
```typescript
{ page: 1, pageSize: 100 }
```

### Entity Status
Many entities have `estaActivo` or `estaPaga` boolean fields for status tracking.

### Date Fields
Dates are typically in ISO string format (`fechaInicio`, `fechaFin`, `fechaCreacion`, etc.)

### Numeric IDs
All IDs are numbers, not strings (e.g., `id: number`, `idSocio: number`)
