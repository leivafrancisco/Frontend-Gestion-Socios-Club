import apiClient from './client';

export interface Socio {
  id: number;
  numeroSocio: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
  estaActivo: boolean;
  fechaAlta: string;
  fechaBaja?: string;
}

export interface CrearSocioDto {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
}

export interface ActualizarSocioDto {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
}

export interface FiltrosSocios {
  search?: string;
  estaActivo?: boolean;
  page?: number;
  pageSize?: number;
}

// Resultado de sp_ResumenSocio
export interface ResumenSocio {
  idSocio: number;
  nombreCompleto: string;
  numeroSocio: string;
  email: string;
  dni?: string;
  estaActivo: boolean;
  fechaAlta: string;
  fechaBaja?: string;
  totalMembresias: number;
  totalCargado: number;
  totalPagado: number;
  saldoPendiente: number;
  ultimaFechaPago?: string;
  asistenciasEsteMes: number;
}

export const sociosService = {
  async obtenerTodos(filtros: FiltrosSocios = {}): Promise<Socio[]> {
    const params = new URLSearchParams();
    
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.estaActivo !== undefined) params.append('estaActivo', filtros.estaActivo.toString());
    if (filtros.page) params.append('page', filtros.page.toString());
    if (filtros.pageSize) params.append('pageSize', filtros.pageSize.toString());
    
    const response = await apiClient.get<Socio[]>(`/socios?${params.toString()}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Socio> {
    const response = await apiClient.get<Socio>(`/socios/${id}`);
    return response.data;
  },

  async obtenerPorNumeroSocio(numeroSocio: string): Promise<Socio> {
    const response = await apiClient.get<Socio>(`/socios/numero/${numeroSocio}`);
    return response.data;
  },

  async crear(datos: CrearSocioDto): Promise<Socio> {
    const response = await apiClient.post<Socio>('/socios', datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarSocioDto): Promise<Socio> {
    const response = await apiClient.put<Socio>(`/socios/${id}`, datos);
    return response.data;
  },

  async desactivar(id: number): Promise<void> {
    await apiClient.put(`/socios/${id}/desactivar`);
  },

  async activar(id: number): Promise<void> {
    await apiClient.put(`/socios/${id}/activar`);
  },

  // Llama a sp_CambiarEstadoSocio en la base de datos
  async cambiarEstado(id: number, estaActivo: boolean): Promise<Socio> {
    const response = await apiClient.put<Socio>(`/socios/${id}/estado`, { estaActivo });
    return response.data;
  },

  // Llama a sp_ResumenSocio en la base de datos
  async obtenerResumen(id: number): Promise<ResumenSocio> {
    const response = await apiClient.get<ResumenSocio>(`/socios/${id}/resumen`);
    return response.data;
  },

  async obtenerTotal(): Promise<number> {
    const response = await apiClient.get<{ total: number }>('/socios/estadisticas/total');
    return response.data.total;
  },
};

export default sociosService;
