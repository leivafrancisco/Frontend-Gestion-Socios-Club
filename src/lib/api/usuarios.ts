import apiClient from './client';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
  rol: string;
  estaActivo: boolean;
  fechaCreacion: string;
}

export interface CrearUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
  nombreUsuario: string;
  password: string;
  rol: string; // "admin" o "recepcionista"
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  dni?: string;
  fechaNacimiento?: string;
  estaActivo?: boolean;
}

export interface FiltrosUsuarios {
  rol?: string;
  estaActivo?: boolean;
}

export const usuariosService = {
  async obtenerTodos(filtros: FiltrosUsuarios = {}): Promise<Usuario[]> {
    const params = new URLSearchParams();

    if (filtros.rol) params.append('rol', filtros.rol);
    if (filtros.estaActivo !== undefined) params.append('estaActivo', filtros.estaActivo.toString());

    const response = await apiClient.get<Usuario[]>(`/usuarios?${params.toString()}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async crear(datos: CrearUsuarioDto): Promise<Usuario> {
    const response = await apiClient.post<Usuario>('/usuarios', datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarUsuarioDto): Promise<Usuario> {
    const response = await apiClient.put<Usuario>(`/usuarios/${id}`, datos);
    return response.data;
  },

  async desactivar(id: number): Promise<void> {
    await apiClient.put(`/usuarios/${id}/desactivar`);
  },
};

export default usuariosService;
