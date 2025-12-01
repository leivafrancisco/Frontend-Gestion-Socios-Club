import apiClient from './client';

export interface MembresiaActividad {
  idActividad: number;
  nombreActividad: string;
  precioAlMomento: number;
}

export interface Membresia {
  id: number;
  idSocio: number;
  nombreSocio: string;
  numeroSocio: string;
  fechaInicio: string;
  fechaFin: string;
  totalCargado: number;
  totalPagado: number;
  saldo: number;
  estaPaga?: boolean;
  actividades: MembresiaActividad[];
  fechaCreacion: string;
}

export interface CrearMembresiaDto {
  idSocio: number;
  fechaInicio: string;
  fechaFin: string;
  idsActividades: number[];
}

export interface AsignarActividadDto {
  idMembresia: number;
  idActividad: number;
}

export interface RemoverActividadDto {
  idMembresia: number;
  idActividad: number;
}

export interface FiltrosMembresias {
  idSocio?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  soloImpagas?: boolean;
  page?: number;
  pageSize?: number;
}

export const membresiasService = {
  async obtenerTodas(filtros?: FiltrosMembresias): Promise<Membresia[]> {
    const params = new URLSearchParams();

    if (filtros?.idSocio) params.append('idSocio', filtros.idSocio.toString());
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros?.soloImpagas !== undefined) params.append('soloImpagas', filtros.soloImpagas.toString());
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.pageSize) params.append('pageSize', filtros.pageSize.toString());

    const queryString = params.toString();
    const response = await apiClient.get<Membresia[]>(`/membresias${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Membresia> {
    const response = await apiClient.get<Membresia>(`/membresias/${id}`);
    return response.data;
  },

  async obtenerPorSocio(idSocio: number): Promise<Membresia[]> {
    const response = await apiClient.get<Membresia[]>(`/membresias?idSocio=${idSocio}`);
    return response.data;
  },

  async obtenerImpagasPorSocio(idSocio: number): Promise<Membresia[]> {
    const response = await apiClient.get<Membresia[]>(`/membresias?idSocio=${idSocio}&soloImpagas=true`);
    return response.data;
  },

  async crear(datos: CrearMembresiaDto): Promise<Membresia> {
    const response = await apiClient.post<Membresia>('/membresias', datos);
    return response.data;
  },

  async asignarActividad(datos: AsignarActividadDto): Promise<void> {
    await apiClient.post('/membresias/asignar-actividad', datos);
  },

  async removerActividad(datos: RemoverActividadDto): Promise<void> {
    await apiClient.post('/membresias/remover-actividad', datos);
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/membresias/${id}`);
  },
};

export default membresiasService;
