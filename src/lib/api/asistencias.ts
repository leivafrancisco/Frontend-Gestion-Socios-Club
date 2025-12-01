import apiClient from './client';

export interface VerificarAsistenciaDto {
  idSocio: number;
  numeroSocio: string;
  nombreSocio: string;
  dni: string;
  tieneAcceso: boolean;
  mensaje: string;
  estadoMembresia: string;
  saldoPendiente?: number;
  fechaVigenciaHasta?: string;
  actividades: string[];
}

export interface AsistenciaDto {
  id: number;
  idSocio: number;
  numeroSocio: string;
  nombreSocio: string;
  fechaHoraIngreso: string;
}

export const asistenciaService = {
  async verificarEstadoSocio(dni: string): Promise<VerificarAsistenciaDto> {
    const response = await apiClient.get<VerificarAsistenciaDto>(`/asistencias/verificar/${dni}`);
    return response.data;
  },

  async registrarAsistencia(dni: string): Promise<AsistenciaDto> {
    const response = await apiClient.post<AsistenciaDto>(`/asistencias/registrar/${dni}`);
    return response.data;
  },

  async obtenerAsistencias(fecha?: string, idSocio?: number): Promise<AsistenciaDto[]> {
    const params = new URLSearchParams();
    if (fecha) params.append('fecha', fecha);
    if (idSocio) params.append('idSocio', idSocio.toString());

    const response = await apiClient.get<AsistenciaDto[]>(`/asistencias?${params.toString()}`);
    return response.data;
  },
};

export default asistenciaService;
