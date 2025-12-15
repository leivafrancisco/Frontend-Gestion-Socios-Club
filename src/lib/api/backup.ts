import apiClient from './client';

// Interfaces
export interface BackupRequest {
  nombreBaseDatos: string;
  rutaDestino: string;
  nombreArchivo: string;
}

export interface BackupResponse {
  exitoso: boolean;
  mensaje: string;
  rutaCompleta: string | null;
  fechaHoraBackup: string;
  tamanoBytes: number | null;
}

export interface BackupFileInfo {
  nombre: string;
  rutaCompleta: string;
  fechaCreacion: string;
  tamanoBytes: number;
  tamanoFormateado: string;
}

export interface RestoreRequest {
  rutaBackup: string;
  nombreBaseDatos: string;
}

export interface RestoreResponse {
  exitoso: boolean;
  mensaje: string;
  fechaHoraRestore: string;
}

// Servicio de backup
export const backupService = {
  /**
   * Obtiene la lista de bases de datos disponibles para backup
   */
  async obtenerBasesDatos(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/backup/bases-datos');
    return response.data;
  },

  /**
   * Crea un backup de la base de datos especificada
   */
  async crearBackup(request: BackupRequest): Promise<BackupResponse> {
    const response = await apiClient.post<BackupResponse>('/backup', request);
    return response.data;
  },

  /**
   * Obtiene la lista de archivos de backup disponibles
   */
  async obtenerArchivos(): Promise<BackupFileInfo[]> {
    const response = await apiClient.get<BackupFileInfo[]>('/backup/archivos');
    return response.data;
  },

  /**
   * Descarga un archivo de backup
   * @param rutaCompleta - Ruta completa del archivo en el servidor
   * @param nombreArchivo - Nombre con el que se descargará el archivo
   */
  async descargarBackup(rutaCompleta: string, nombreArchivo: string): Promise<void> {
    const response = await apiClient.post(
      '/backup/descargar',
      { rutaCompleta },
      {
        responseType: 'blob', // Importante para archivos binarios
      }
    );

    // Crear un blob URL y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Restaura una base de datos desde un archivo de backup
   * IMPORTANTE: Después de un restore exitoso, el frontend DEBE cerrar sesión
   * y recargar la aplicación, ya que los datos en memoria están obsoletos
   * @param request - Datos para la restauración (ruta del backup y nombre de BD)
   */
  async restaurarBackup(request: RestoreRequest): Promise<RestoreResponse> {
    const response = await apiClient.post<RestoreResponse>('/backup/restaurar', request);
    return response.data;
  },
};
