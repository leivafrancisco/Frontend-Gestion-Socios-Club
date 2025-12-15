import apiClient from './client';

// Interfaces según documentación del backend
export interface AuditoriaDto {
  id: number;
  tabla: string;
  operacion: "INSERT" | "UPDATE" | "DELETE";
  idUsuario: number | null;
  nombreUsuario: string | null;
  fechaHora: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
  nombreEntidad: string | null;
  idEntidad: string | null;
  detalles: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditoriaFiltros {
  tabla?: string;
  operacion?: string;
  idUsuario?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

// Servicio de auditoría
export const auditoriaService = {
  /**
   * Lista auditorías con paginación y filtros opcionales
   */
  async listar(filtros: AuditoriaFiltros = {}): Promise<PagedResult<AuditoriaDto>> {
    const params = new URLSearchParams();

    // Agregar filtros si están presentes
    if (filtros.tabla) params.append('tabla', filtros.tabla);
    if (filtros.operacion) params.append('operacion', filtros.operacion);
    if (filtros.idUsuario) params.append('idUsuario', filtros.idUsuario.toString());
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.page) params.append('page', filtros.page.toString());
    if (filtros.pageSize) params.append('pageSize', filtros.pageSize.toString());

    const response = await apiClient.get<PagedResult<AuditoriaDto>>(
      `/auditoria?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtiene el detalle de una auditoría específica por ID
   */
  async obtenerDetalle(id: number): Promise<AuditoriaDto> {
    const response = await apiClient.get<AuditoriaDto>(`/auditoria/${id}`);
    return response.data;
  },
};

/**
 * Utilidad para parsear valores JSON de auditoría
 * Convierte strings JSON en objetos, maneja casos nulos
 */
export const parseValoresAuditoria = (valores: string | null): any => {
  if (!valores) return null;

  try {
    return JSON.parse(valores);
  } catch (error) {
    console.error('Error al parsear valores de auditoría:', error);
    return valores; // Devolver el string original si falla el parse
  }
};

/**
 * Obtiene el color del badge según el tipo de operación
 */
export const getOperacionColor = (operacion: string): string => {
  switch (operacion) {
    case 'INSERT':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'UPDATE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DELETE':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Opciones de tablas para el filtro
 */
export const TABLAS_OPCIONES = [
  { value: 'Socios', label: 'Socios' },
  { value: 'Membresias', label: 'Membresías' },
  { value: 'Pagos', label: 'Pagos' },
  { value: 'Asistencias', label: 'Asistencias' },
  { value: 'Actividades', label: 'Actividades' },
  { value: 'Usuarios', label: 'Usuarios' },
  { value: 'Roles', label: 'Roles' },
];

/**
 * Opciones de operaciones para el filtro
 */
export const OPERACIONES_OPCIONES = [
  { value: 'INSERT', label: 'INSERT' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
];
