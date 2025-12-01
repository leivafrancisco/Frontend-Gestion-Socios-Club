import apiClient from './client';

export interface Actividad {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  fechaCreacion: string;
}

export interface CrearActividadDto {
  nombre: string;
  descripcion?: string;
  precio: number;
}

export interface ActualizarActividadDto {
  nombre: string;
  descripcion?: string;
  precio: number;
}

export const actividadesService = {
  async obtenerTodas(): Promise<Actividad[]> {
    const response = await apiClient.get<Actividad[]>('/actividades');
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Actividad> {
    const response = await apiClient.get<Actividad>(`/actividades/${id}`);
    return response.data;
  },

  async crear(datos: CrearActividadDto): Promise<Actividad> {
    const response = await apiClient.post<Actividad>('/actividades', datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarActividadDto): Promise<Actividad> {
    const response = await apiClient.put<Actividad>(`/actividades/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/actividades/${id}`);
  },
};

export default actividadesService;
