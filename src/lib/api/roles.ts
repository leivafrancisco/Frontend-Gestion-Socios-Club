import apiClient from './client';

export interface Rol {
  id: number;
  nombre: string;
}

export interface CrearRolDto {
  nombre: string;
}

export interface ActualizarRolDto {
  nombre: string;
}

export const rolesService = {
  async obtenerTodos(): Promise<Rol[]> {
    const response = await apiClient.get<Rol[]>('/roles');
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Rol> {
    const response = await apiClient.get<Rol>(`/roles/${id}`);
    return response.data;
  },

  async crear(datos: CrearRolDto): Promise<Rol> {
    const response = await apiClient.post<Rol>('/roles', datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarRolDto): Promise<Rol> {
    const response = await apiClient.put<Rol>(`/roles/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};

export default rolesService;
