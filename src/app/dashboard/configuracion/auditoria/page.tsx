'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  auditoriaService,
  AuditoriaDto,
  AuditoriaFiltros,
  parseValoresAuditoria,
  getOperacionColor,
  TABLAS_OPCIONES,
  OPERACIONES_OPCIONES,
} from '@/lib/api/auditoria';
import {
  ClipboardList,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function AuditoriaPage() {
  const router = useRouter();

  // State para autenticación y autorización
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // State para los filtros
  const [filtros, setFiltros] = useState<AuditoriaFiltros>({
    page: 1,
    pageSize: 20,
  });

  // State para los datos
  const [auditorias, setAuditorias] = useState<AuditoriaDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // State para el modal de detalle
  const [selectedAuditoria, setSelectedAuditoria] = useState<AuditoriaDto | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

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
        const rol = usuario?.rol?.toLowerCase();

        if (rol !== 'superadmin') {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [router]);

  // Cargar auditorías cuando cambian los filtros
  useEffect(() => {
    if (!isAuthorized) return;

    cargarAuditorias();
  }, [isAuthorized, filtros]);

  const cargarAuditorias = async () => {
    setLoading(true);
    setError('');

    try {
      const resultado = await auditoriaService.listar(filtros);
      setAuditorias(resultado.items);
      setTotalCount(resultado.totalCount);
      setTotalPages(resultado.totalPages);
    } catch (err: any) {
      console.error('Error al cargar auditorías:', err);

      if (err.response?.status === 403) {
        setError('No tienes permisos para ver el registro de auditoría');
      } else if (err.response?.status === 401) {
        setError('Sesión expirada');
      } else {
        setError('Error al cargar el registro de auditoría');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
      page: 1, // Resetear a página 1 al cambiar filtros
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      pageSize: 20,
    });
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, page: nuevaPagina }));
  };

  // Ver detalle de auditoría
  const verDetalle = async (id: number) => {
    try {
      const detalle = await auditoriaService.obtenerDetalle(id);
      setSelectedAuditoria(detalle);
      setShowModal(true);
    } catch (err) {
      console.error('Error al obtener detalle:', err);
      alert('Error al cargar el detalle de la auditoría');
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedAuditoria(null);
  };

  // Renderizar JSON de forma legible
  const renderJSON = (valores: string | null) => {
    const parsed = parseValoresAuditoria(valores);

    if (!parsed) {
      return <span className="text-gray-400 italic">Sin datos</span>;
    }

    if (typeof parsed === 'string') {
      return <span className="text-gray-600">{parsed}</span>;
    }

    return (
      <pre className="bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto text-xs">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Auditoría del Sistema</h1>
        </div>
        <p className="text-gray-600">
          Registro completo de todas las operaciones realizadas en el sistema.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por tabla */}
          <div>
            <label htmlFor="tabla" className="block text-sm font-medium text-gray-700 mb-1">
              Tabla
            </label>
            <select
              id="tabla"
              name="tabla"
              value={filtros.tabla || ''}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {TABLAS_OPCIONES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por operación */}
          <div>
            <label htmlFor="operacion" className="block text-sm font-medium text-gray-700 mb-1">
              Operación
            </label>
            <select
              id="operacion"
              name="operacion"
              value={filtros.operacion || ''}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {OPERACIONES_OPCIONES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fecha desde */}
          <div>
            <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              id="fechaDesde"
              name="fechaDesde"
              value={filtros.fechaDesde || ''}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por fecha hasta */}
          <div>
            <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              id="fechaHasta"
              name="fechaHasta"
              value={filtros.fechaHasta || ''}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <X className="w-4 h-4" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla de auditorías */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Registros de Auditoría</h2>
          {!loading && (
            <span className="text-sm text-gray-600">
              Total: {totalCount} registro{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Cargando registros...</span>
          </div>
        )}

        {/* Lista vacía */}
        {!loading && !error && auditorias.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No se encontraron registros</p>
            <p className="text-sm text-gray-500 mt-1">
              Intenta ajustar los filtros o verifica que haya actividad en el sistema
            </p>
          </div>
        )}

        {/* Tabla */}
        {!loading && !error && auditorias.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tabla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditorias.map((auditoria) => (
                  <tr key={auditoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(auditoria.fechaHora).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {auditoria.nombreUsuario || (
                        <span className="text-gray-400 italic">Sistema</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {auditoria.tabla}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getOperacionColor(
                          auditoria.operacion
                        )}`}
                      >
                        {auditoria.operacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {auditoria.nombreEntidad || auditoria.idEntidad || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => verDetalle(auditoria.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && auditorias.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {filtros.page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarPagina((filtros.page || 1) - 1)}
                disabled={filtros.page === 1}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() => cambiarPagina((filtros.page || 1) + 1)}
                disabled={filtros.page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {showModal && selectedAuditoria && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Detalle de Auditoría</h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4 space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedAuditoria.fechaHora).toLocaleString('es-ES', {
                      dateStyle: 'long',
                      timeStyle: 'long',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <p className="text-gray-900">
                    {selectedAuditoria.nombreUsuario || (
                      <span className="text-gray-400 italic">Sistema</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tabla</label>
                  <p className="text-gray-900">{selectedAuditoria.tabla}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operación
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getOperacionColor(
                      selectedAuditoria.operacion
                    )}`}
                  >
                    {selectedAuditoria.operacion}
                  </span>
                </div>
                {selectedAuditoria.nombreEntidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entidad
                    </label>
                    <p className="text-gray-900">{selectedAuditoria.nombreEntidad}</p>
                  </div>
                )}
                {selectedAuditoria.idEntidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Entidad
                    </label>
                    <p className="text-gray-900">{selectedAuditoria.idEntidad}</p>
                  </div>
                )}
              </div>

              {/* Detalles adicionales */}
              {selectedAuditoria.detalles && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedAuditoria.detalles}
                  </p>
                </div>
              )}

              {/* Comparación de valores (antes/después) */}
              {(selectedAuditoria.valoresAnteriores || selectedAuditoria.valoresNuevos) && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Cambios Realizados</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Valores anteriores */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valores Anteriores
                      </label>
                      {renderJSON(selectedAuditoria.valoresAnteriores)}
                    </div>

                    {/* Valores nuevos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valores Nuevos
                      </label>
                      {renderJSON(selectedAuditoria.valoresNuevos)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
