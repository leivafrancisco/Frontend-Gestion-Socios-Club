import apiClient from './client';

export interface LoginDto {
  nombreUsuario: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  estaActivo: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export const authService = {
  async login(datos: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', datos);
    
    // Guardar token y usuario en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  },

  async obtenerUsuarioActual(): Promise<Usuario> {
    const response = await apiClient.get<Usuario>('/auth/me');
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getUsuario(): Usuario | null {
    if (typeof window !== 'undefined') {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    }
    return null;
  },
};

export default authService;
