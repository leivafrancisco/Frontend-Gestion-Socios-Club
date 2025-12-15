'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { backupService, BackupRequest, BackupResponse, BackupFileInfo, RestoreRequest } from '@/lib/api/backup';
import { Database, Download, AlertCircle, CheckCircle2, Copy, Loader2, ArrowDownToLine, FileArchive, Calendar, HardDrive, RotateCcw, X } from 'lucide-react';
import { validateRequired } from '@/lib/utils/validation';

export default function BackupPage() {
  const router = useRouter();

  // State para autenticación y autorización
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // State para bases de datos
  const [basesDatos, setBasesDatos] = useState<string[]>([]);
  const [loadingBases, setLoadingBases] = useState<boolean>(false);
  const [errorBases, setErrorBases] = useState<string>('');

  // State del formulario
  const [formData, setFormData] = useState<BackupRequest>({
    nombreBaseDatos: '',
    rutaDestino: '',
    nombreArchivo: '',
  });
  const [errors, setErrors] = useState<Partial<BackupRequest>>({});

  // State para el proceso de backup
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);
  const [backupResult, setBackupResult] = useState<BackupResponse | null>(null);
  const [downloadingBackup, setDownloadingBackup] = useState<boolean>(false);

  // State para lista de archivos de backup
  const [archivosBackup, setArchivosBackup] = useState<BackupFileInfo[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState<boolean>(false);
  const [errorArchivos, setErrorArchivos] = useState<string>('');
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // State para el modal de restauración
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [selectedFileForRestore, setSelectedFileForRestore] = useState<BackupFileInfo | null>(null);
  const [restoringBackup, setRestoringBackup] = useState<boolean>(false);

  // Verificar autorización al montar el componente
  useEffect(() => {
    const checkAuthorization = () => {
      const usuarioStr = localStorage.getItem('usuario');

      if (!usuarioStr) {
        router.push('/login');
        return;
      }

      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.rol?.toLowerCase() !== 'superadmin') {
          // No autorizado - redirigir al dashboard
          router.push('/dashboard');
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error al verificar autorización:', error);
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [router]);

  // Cargar bases de datos disponibles
  useEffect(() => {
    if (!isAuthorized) return;

    const cargarBasesDatos = async () => {
      setLoadingBases(true);
      setErrorBases('');

      try {
        const bases = await backupService.obtenerBasesDatos();
        setBasesDatos(bases);

        // Seleccionar la primera base de datos por defecto
        if (bases.length > 0) {
          setFormData(prev => ({ ...prev, nombreBaseDatos: bases[0] }));
        }
      } catch (error: any) {
        console.error('Error al cargar bases de datos:', error);

        if (error.response?.status === 403) {
          setErrorBases('No tienes permisos para acceder a esta funcionalidad');
        } else if (error.response?.status === 401) {
          setErrorBases('Sesión expirada. Por favor inicia sesión nuevamente');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setErrorBases('Error al cargar las bases de datos disponibles');
        }
      } finally {
        setLoadingBases(false);
      }
    };

    cargarBasesDatos();
  }, [isAuthorized, router]);

  // Cargar archivos de backup disponibles
  useEffect(() => {
    if (!isAuthorized) return;

    const cargarArchivos = async () => {
      setLoadingArchivos(true);
      setErrorArchivos('');

      try {
        const archivos = await backupService.obtenerArchivos();
        setArchivosBackup(archivos);
      } catch (error: any) {
        console.error('Error al cargar archivos de backup:', error);

        if (error.response?.status === 403) {
          setErrorArchivos('No tienes permisos para ver los archivos de backup');
        } else if (error.response?.status === 401) {
          setErrorArchivos('Sesión expirada');
        } else {
          setErrorArchivos('Error al cargar la lista de archivos de backup');
        }
      } finally {
        setLoadingArchivos(false);
      }
    };

    cargarArchivos();
  }, [isAuthorized]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<BackupRequest> = {};

    // Validar base de datos
    const dbError = validateRequired(formData.nombreBaseDatos, 'La base de datos');
    if (dbError) {
      newErrors.nombreBaseDatos = dbError;
    }

    // Validar ruta de destino
    const rutaError = validateRequired(formData.rutaDestino, 'La ruta de destino');
    if (rutaError) {
      newErrors.rutaDestino = rutaError;
    } else {
      // Validación básica de formato de ruta
      const ruta = formData.rutaDestino.trim();
      const isWindowsPath = /^[a-zA-Z]:\\/.test(ruta);
      const isUnixPath = ruta.startsWith('/');

      if (!isWindowsPath && !isUnixPath) {
        newErrors.rutaDestino = 'La ruta debe ser absoluta (ej: C:\\Backups o /var/backups)';
      }
    }

    // Validar nombre de archivo
    const nombreError = validateRequired(formData.nombreArchivo, 'El nombre del archivo');
    if (nombreError) {
      newErrors.nombreArchivo = nombreError;
    } else {
      // Validación de caracteres permitidos
      const nombre = formData.nombreArchivo.trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(nombre)) {
        newErrors.nombreArchivo = 'Solo se permiten letras, números, guiones y guiones bajos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Prevenir solo espacios en blanco en inputs de texto
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
      // Si el nuevo valor es solo espacios, no actualizar
      if (value.length > 0 && value.trim().length === 0) {
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo al modificarlo
    if (errors[name as keyof BackupRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Manejar blur (al perder foco) - aplicar trim
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();

    if (trimmedValue !== value) {
      setFormData(prev => ({ ...prev, [name]: trimmedValue }));
    }
  };

  // Generar nombre de archivo de ejemplo
  const getExampleFileName = (): string => {
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10).replace(/-/g, '');
    const hora = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const nombre = formData.nombreArchivo.trim() || 'backup';
    return `${nombre}_${fecha}_${hora}.bak`;
  };

  // Formatear bytes a tamaño legible
  const formatBytes = (bytes: number | null): string => {
    if (bytes === null || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Copiar ruta al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Ruta copiada al portapapeles');
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  // Crear backup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Confirmación antes de crear el backup
    const confirmed = window.confirm(
      `¿Confirmar creación de backup?\n\n` +
      `Base de datos: ${formData.nombreBaseDatos}\n` +
      `Ruta: ${formData.rutaDestino}\n` +
      `Archivo: ${getExampleFileName()}\n\n` +
      `Este proceso puede tardar varios minutos.`
    );

    if (!confirmed) return;

    setCreatingBackup(true);
    setBackupResult(null);

    try {
      const result = await backupService.crearBackup(formData);
      setBackupResult(result);

      // Si fue exitoso, limpiar el nombre del archivo y recargar la lista
      if (result.exitoso) {
        setFormData(prev => ({ ...prev, nombreArchivo: '' }));
        // Recargar lista de archivos después de crear el backup
        await recargarArchivos();
      }
    } catch (error: any) {
      console.error('Error al crear backup:', error);

      // Construir resultado de error
      const errorResult: BackupResponse = {
        exitoso: false,
        mensaje: error.response?.data?.mensaje ||
                 error.response?.data ||
                 'Error al crear el backup. Por favor intenta nuevamente.',
        rutaCompleta: null,
        fechaHoraBackup: new Date().toISOString(),
        tamanoBytes: null,
      };

      setBackupResult(errorResult);
    } finally {
      setCreatingBackup(false);
    }
  };

  // Resetear formulario para nuevo backup
  const resetForNewBackup = () => {
    setBackupResult(null);
    setFormData(prev => ({ ...prev, nombreArchivo: '' }));
  };

  // Descargar archivo de backup desde el resultado
  const handleDescargarBackup = async () => {
    if (!backupResult?.rutaCompleta) return;

    setDownloadingBackup(true);
    try {
      // Extraer el nombre del archivo de la ruta completa
      const nombreArchivo = backupResult.rutaCompleta.split(/[/\\]/).pop() || 'backup.bak';

      await backupService.descargarBackup(backupResult.rutaCompleta, nombreArchivo);
      alert('Descarga iniciada correctamente');
    } catch (error: any) {
      console.error('Error al descargar backup:', error);
      alert(
        error.response?.data?.mensaje ||
        'Error al descargar el archivo. Por favor verifica que el archivo existe en el servidor.'
      );
    } finally {
      setDownloadingBackup(false);
    }
  };

  // Descargar archivo de backup desde el listado
  const handleDescargarArchivo = async (archivo: BackupFileInfo) => {
    setDownloadingFile(archivo.nombre);
    try {
      await backupService.descargarBackup(archivo.rutaCompleta, archivo.nombre);
      alert('Descarga iniciada correctamente');
    } catch (error: any) {
      console.error('Error al descargar archivo:', error);
      alert(
        error.response?.data?.mensaje ||
        'Error al descargar el archivo. Por favor verifica que el archivo existe en el servidor.'
      );
    } finally {
      setDownloadingFile(null);
    }
  };

  // Recargar lista de archivos después de crear backup
  const recargarArchivos = async () => {
    try {
      const archivos = await backupService.obtenerArchivos();
      setArchivosBackup(archivos);
    } catch (error) {
      console.error('Error al recargar archivos:', error);
    }
  };

  // Abrir modal de confirmación para restaurar
  const abrirModalRestore = (archivo: BackupFileInfo) => {
    setSelectedFileForRestore(archivo);
    setShowRestoreModal(true);
  };

  // Cerrar modal de restauración
  const cerrarModalRestore = () => {
    if (!restoringBackup) {
      setShowRestoreModal(false);
      setSelectedFileForRestore(null);
    }
  };

  // Ejecutar restauración
  const confirmarRestauracion = async () => {
    if (!selectedFileForRestore) return;

    // Obtener la primera base de datos disponible (normalmente "gestion_club")
    const nombreBaseDatos = basesDatos.length > 0 ? basesDatos[0] : 'gestion_club';

    const restoreRequest: RestoreRequest = {
      rutaBackup: selectedFileForRestore.rutaCompleta,
      nombreBaseDatos: nombreBaseDatos,
    };

    setRestoringBackup(true);

    try {
      const resultado = await backupService.restaurarBackup(restoreRequest);

      if (resultado.exitoso) {
        alert(`✅ ${resultado.mensaje}\n\n⚠️ La aplicación se recargará para reflejar los cambios.`);

        // Cerrar sesión y recargar después de 2 segundos
        setTimeout(() => {
          // Limpiar todo el almacenamiento
          localStorage.clear();
          sessionStorage.clear();

          // Redirigir al login
          window.location.href = '/login';
        }, 2000);
      } else {
        alert(`❌ Error: ${resultado.mensaje}`);
        setRestoringBackup(false);
        cerrarModalRestore();
      }
    } catch (error: any) {
      console.error('Error al restaurar backup:', error);
      const errorMessage = error.response?.data?.mensaje ||
                          error.response?.data?.message ||
                          'Error al restaurar el backup. Por favor verifica que el archivo existe y la base de datos está disponible.';
      alert(`❌ ${errorMessage}`);
      setRestoringBackup(false);
      cerrarModalRestore();
    }
  };

  // Mostrar loading mientras verifica autorización
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autorizado (ya está redirigiendo)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Backup de Base de Datos</h1>
        </div>
        <p className="text-gray-600">
          Este respaldo genera una copia completa de la base de datos seleccionada.
          El archivo resultante permite restaurar la información ante errores, fallas del sistema o pérdida de datos.
        </p>
      </div>

      {/* Alert de error al cargar bases */}
      {errorBases && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{errorBases}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit}>
          {/* Base de Datos */}
          <div className="mb-6">
            <label htmlFor="nombreBaseDatos" className="block text-sm font-medium text-gray-700 mb-2">
              Base de Datos *
            </label>
            {loadingBases ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Cargando bases de datos...</span>
              </div>
            ) : (
              <>
                <select
                  id="nombreBaseDatos"
                  name="nombreBaseDatos"
                  value={formData.nombreBaseDatos}
                  onChange={handleChange}
                  disabled={basesDatos.length === 0 || creatingBackup}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nombreBaseDatos ? 'border-red-500' : 'border-gray-300'
                  } ${basesDatos.length === 0 || creatingBackup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  {basesDatos.length === 0 && (
                    <option value="">No hay bases de datos disponibles</option>
                  )}
                  {basesDatos.map(base => (
                    <option key={base} value={base}>
                      {base}
                    </option>
                  ))}
                </select>
                {errors.nombreBaseDatos && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombreBaseDatos}</p>
                )}
              </>
            )}
          </div>

          {/* Ruta de Destino */}
          <div className="mb-6">
            <label htmlFor="rutaDestino" className="block text-sm font-medium text-gray-700 mb-2">
              Ruta de Destino *
            </label>
            <input
              type="text"
              id="rutaDestino"
              name="rutaDestino"
              value={formData.rutaDestino}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={creatingBackup}
              placeholder="C:\Backups  o  /var/backups"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rutaDestino ? 'border-red-500' : 'border-gray-300'
              } ${creatingBackup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.rutaDestino ? (
              <p className="mt-1 text-sm text-red-600">{errors.rutaDestino}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Ruta completa donde se guardará el backup. La ruta debe existir en el servidor.
              </p>
            )}
          </div>

          {/* Nombre del Archivo */}
          <div className="mb-6">
            <label htmlFor="nombreArchivo" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Archivo *
            </label>
            <input
              type="text"
              id="nombreArchivo"
              name="nombreArchivo"
              value={formData.nombreArchivo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={creatingBackup}
              placeholder="backup_club"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nombreArchivo ? 'border-red-500' : 'border-gray-300'
              } ${creatingBackup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.nombreArchivo ? (
              <p className="mt-1 text-sm text-red-600">{errors.nombreArchivo}</p>
            ) : (
              <div className="mt-1 text-sm text-gray-500">
                <p>Solo letras, números, guiones y guiones bajos. Sin extensión.</p>
                {formData.nombreArchivo && (
                  <p className="mt-1 font-medium text-gray-700">
                    Archivo generado: <span className="text-blue-600">{getExampleFileName()}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botón de Acción */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={creatingBackup || basesDatos.length === 0 || !!errorBases}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {creatingBackup ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando Backup...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Crear Backup</span>
                </>
              )}
            </button>

            {backupResult && backupResult.exitoso && (
              <button
                type="button"
                onClick={resetForNewBackup}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Nuevo Backup
              </button>
            )}
          </div>

          {/* Advertencia de timeout */}
          {creatingBackup && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Este proceso puede tardar varios minutos dependiendo del tamaño de la base de datos.
                Por favor no cierres esta ventana.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Resultado del Backup */}
      {backupResult && (
        <div
          className={`p-6 rounded-lg border-2 ${
            backupResult.exitoso
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {backupResult.exitoso ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h3
                className={`text-lg font-bold mb-2 ${
                  backupResult.exitoso ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {backupResult.exitoso ? 'Backup Creado Exitosamente' : 'Error al Crear Backup'}
              </h3>

              <p
                className={`mb-4 ${
                  backupResult.exitoso ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {backupResult.mensaje}
              </p>

              {backupResult.exitoso && backupResult.rutaCompleta && (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="text-sm font-medium text-gray-700 mb-1">Ruta del Archivo:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-900 flex-1 break-all">
                        {backupResult.rutaCompleta}
                      </code>
                      <button
                        onClick={() => copyToClipboard(backupResult.rutaCompleta!)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                        title="Copiar ruta"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {backupResult.tamanoBytes !== null && (
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-sm font-medium text-gray-700">Tamaño:</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatBytes(backupResult.tamanoBytes)}
                        </p>
                      </div>
                    )}

                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-sm font-medium text-gray-700">Fecha y Hora:</p>
                      <p className="text-sm text-gray-900">
                        {new Date(backupResult.fechaHoraBackup).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Botón de Descarga */}
                  <div className="mt-4">
                    <button
                      onClick={handleDescargarBackup}
                      disabled={downloadingBackup}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {downloadingBackup ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Descargando...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-5 h-5" />
                          <span>Descargar Archivo de Backup</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-xs text-gray-600 text-center">
                      El archivo se descargará en tu carpeta de Descargas
                    </p>
                  </div>
                </div>
              )}

              {!backupResult.exitoso && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-red-900 mb-2">Posibles soluciones:</p>
                  <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                    <li>Verifica que la ruta de destino exista en el servidor</li>
                    <li>Asegúrate de que el usuario SQL tenga permisos de backup</li>
                    <li>Verifica que haya espacio suficiente en el disco</li>
                    <li>Revisa los logs del servidor para más detalles</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Archivos de Backup Disponibles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileArchive className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Archivos de Backup Disponibles</h2>
        </div>

        {/* Error al cargar archivos */}
        {errorArchivos && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{errorArchivos}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loadingArchivos && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Cargando archivos...</span>
          </div>
        )}

        {/* Lista vacía */}
        {!loadingArchivos && !errorArchivos && archivosBackup.length === 0 && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay archivos de backup disponibles</p>
            <p className="text-sm text-gray-500 mt-1">Crea tu primer backup usando el formulario anterior</p>
          </div>
        )}

        {/* Lista de archivos */}
        {!loadingArchivos && !errorArchivos && archivosBackup.length > 0 && (
          <div className="space-y-3">
            {archivosBackup.map((archivo) => (
              <div
                key={archivo.rutaCompleta}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileArchive className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 truncate">{archivo.nombre}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {/* Fecha */}
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(archivo.fechaCreacion).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* Tamaño */}
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <HardDrive className="w-4 h-4 flex-shrink-0" />
                        <span>{archivo.tamanoFormateado}</span>
                      </div>

                      {/* Ruta */}
                      <div className="flex items-center gap-1.5 text-gray-500 md:col-span-1">
                        <code className="text-xs truncate" title={archivo.rutaCompleta}>
                          {archivo.rutaCompleta}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Botón de descarga */}
                    <button
                      onClick={() => handleDescargarArchivo(archivo)}
                      disabled={downloadingFile === archivo.nombre}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Descargar archivo"
                    >
                      {downloadingFile === archivo.nombre ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Descargando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Descargar</span>
                        </>
                      )}
                    </button>

                    {/* Botón de restaurar */}
                    <button
                      onClick={() => abrirModalRestore(archivo)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                      title="Restaurar desde este backup"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Restaurar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        {!loadingArchivos && !errorArchivos && archivosBackup.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total de backups:</strong> {archivosBackup.length} archivo{archivosBackup.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Restauración */}
      {showRestoreModal && selectedFileForRestore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModalRestore}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirmar Restauración</h3>
              </div>
              {!restoringBackup && (
                <button
                  onClick={cerrarModalRestore}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-6 space-y-4">
              {/* Advertencia principal */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">⚠️ ADVERTENCIA IMPORTANTE</h4>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>Esta acción reemplazará TODOS los datos actuales de la base de datos</li>
                      <li>Se perderán todos los cambios realizados después de este backup</li>
                      <li>La aplicación cerrará sesión automáticamente después de restaurar</li>
                      <li>Esta operación NO se puede deshacer</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Información del archivo seleccionado */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Archivo de Backup Seleccionado:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <span className="text-gray-900">{selectedFileForRestore.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <span className="text-gray-900">
                      {new Date(selectedFileForRestore.fechaCreacion).toLocaleString('es-ES', {
                        dateStyle: 'long',
                        timeStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Tamaño:</span>
                    <span className="text-gray-900">{selectedFileForRestore.tamanoFormateado}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span className="font-medium text-gray-700">Base de Datos:</span>
                    <span className="text-gray-900">{basesDatos.length > 0 ? basesDatos[0] : 'gestion_club'}</span>
                  </div>
                </div>
              </div>

              {/* Pregunta de confirmación */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900">
                  ¿Estás seguro de que deseas restaurar la base de datos desde este backup?
                </p>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={cerrarModalRestore}
                disabled={restoringBackup}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRestauracion}
                disabled={restoringBackup}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {restoringBackup ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Restaurando...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span>Sí, Restaurar Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
