import apiClient from './client';

export type CuotaEstado = 'pendiente' | 'pagada' | 'vencida';

export interface CuotaDto {
  id: number;
  idMembresia: number;
  periodoMembresia: string; // Ejemplo: "01/01/2025 - 31/03/2025"
  idSocio: number;
  numeroSocio: string;
  nombreSocio: string;
  numeroCuota: number;
  monto: number;
  fechaVencimiento: string; // ISO DateTime
  estado: CuotaEstado;
  esMorosa: boolean;
  diasVencida: number;
  fechaCreacion: string; // ISO DateTime
  actividades: string[];
}

export interface MorosoDto {
  idSocio: number;
  numeroSocio: string;
  nombreSocio: string;
  email: string;
  cuotasVencidas: number;
  deudaTotal: number;
  fechaVencimientoMasTemprana: string; // ISO DateTime
  cuotas: CuotaDto[];
}

export interface ResumenCuotasDto {
  totalCuotas: number;
  cuotasPendientes: number;
  cuotasPagadas: number;
  cuotasVencidas: number;
  montoTotalPendiente: number;
  montoTotalVencido: number;
  totalMorosos: number;
}

export interface FiltrosCuotasDto {
  idMembresia?: number;
  idSocio?: number;
  estado?: CuotaEstado;
  soloVencidas?: boolean;
  fechaVencimientoDesde?: string;
  fechaVencimientoHasta?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const cuotasService = {
  /**
   * Obtiene la lista de cuotas según filtros (soporta paginación)
   */
  async obtenerTodas(filtros?: Partial<FiltrosCuotasDto>): Promise<CuotaDto[]> {
    const params = new URLSearchParams();
    if (filtros) {
      if (filtros.idMembresia !== undefined) params.append('idMembresia', filtros.idMembresia.toString());
      if (filtros.idSocio !== undefined) params.append('idSocio', filtros.idSocio.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.soloVencidas !== undefined) params.append('soloVencidas', filtros.soloVencidas.toString());
      if (filtros.fechaVencimientoDesde) params.append('fechaVencimientoDesde', filtros.fechaVencimientoDesde);
      if (filtros.fechaVencimientoHasta) params.append('fechaVencimientoHasta', filtros.fechaVencimientoHasta);
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.page !== undefined) params.append('page', filtros.page.toString());
      if (filtros.pageSize !== undefined) params.append('pageSize', filtros.pageSize.toString());
    }
    const queryString = params.toString();
    const response = await apiClient.get<CuotaDto[]>(`/cuotas${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  /**
   * Obtiene una cuota por su ID
   */
  async obtenerPorId(id: number): Promise<CuotaDto> {
    const response = await apiClient.get<CuotaDto>(`/cuotas/${id}`);
    return response.data;
  },

  /**
   * Obtiene las cuotas de una membresía específica
   */
  async obtenerPorMembresia(idMembresia: number): Promise<CuotaDto[]> {
    const response = await apiClient.get<CuotaDto[]>(`/cuotas/membresia/${idMembresia}`);
    return response.data;
  },

  /**
   * Obtiene el historial de cuotas de un socio
   */
  async obtenerPorSocio(idSocio: number): Promise<CuotaDto[]> {
    const response = await apiClient.get<CuotaDto[]>(`/cuotas/socio/${idSocio}`);
    return response.data;
  },

  /**
   * Obtiene estadísticas de recaudación y estado de cuotas (Solo Admin)
   */
  async obtenerResumen(): Promise<ResumenCuotasDto> {
    const response = await apiClient.get<ResumenCuotasDto>('/cuotas/resumen');
    return response.data;
  },

  /**
   * Obtiene la lista de socios morosos (Solo Admin)
   */
  async obtenerMorosos(): Promise<MorosoDto[]> {
    const response = await apiClient.get<MorosoDto[]>('/cuotas/morosos');
    return response.data;
  },

  /**
   * Genera las cuotas para una membresía (Solo Admin)
   */
  async generarCuotas(idMembresia: number): Promise<CuotaDto[]> {
    const response = await apiClient.post<CuotaDto[]>(`/cuotas/generar/${idMembresia}`);
    return response.data;
  },

  /**
   * Actualiza el estado de cuotas vencidas (lote automático) (Solo Admin)
   */
  async actualizarVencidas(): Promise<{ message: string; cantidad: number }> {
    const response = await apiClient.post<{ message: string; cantidad: number }>('/cuotas/actualizar-vencidas');
    return response.data;
  },
};

export default cuotasService;
