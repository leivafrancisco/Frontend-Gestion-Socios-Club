'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usuariosService, type Usuario } from '@/lib/api/usuarios';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  UserX,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, rolFilter, estadoFilter, usuarios]);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await usuariosService.obtenerTodos();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...usuarios];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (u) =>
          u.nombreCompleto.toLowerCase().includes(term) ||
          u.nombreUsuario.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.dni?.toLowerCase().includes(term)
      );
    }

    // Filtro por rol
    if (rolFilter) {
      resultado = resultado.filter((u) => u.rol === rolFilter);
    }

    // Filtro por estado
    if (estadoFilter === 'activos') {
      resultado = resultado.filter((u) => u.estaActivo);
    } else if (estadoFilter === 'inactivos') {
      resultado = resultado.filter((u) => !u.estaActivo);
    }

    setFilteredUsuarios(resultado);
  };

  const handleDesactivar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de desactivar al usuario "${nombre}"?`)) {
      return;
    }

    try {
      await usuariosService.desactivar(id);
      setSuccess(`Usuario "${nombre}" desactivado exitosamente`);
      cargarUsuarios();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error al desactivar usuario:', error);
      setError(error.response?.data?.message || 'Error al desactivar el usuario');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getRolBadgeColor = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recepcionista':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'superadmin':
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'recepcionista':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-gray-600 mt-2">Gestiona los usuarios que tienen acceso al sistema</p>
        </div>
        <Link
          href="/dashboard/configuracion/usuarios/nuevo"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Éxito</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, usuario, email, DNI..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Rol
            </label>
            <select
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Administrador</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
        </div>
      </div>

      {/* Lista de Usuarios */}
      {filteredUsuarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || rolFilter || estadoFilter !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando el primer usuario del sistema'}
          </p>
          {!searchTerm && !rolFilter && estadoFilter === 'todos' && (
            <Link
              href="/dashboard/configuracion/usuarios/nuevo"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Primer Usuario
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Información Personal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombreCompleto}
                          </div>
                          <div className="text-sm text-gray-500">@{usuario.nombreUsuario}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{usuario.email}</div>
                      {usuario.dni && (
                        <div className="text-sm text-gray-500">DNI: {usuario.dni}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRolBadgeColor(
                          usuario.rol
                        )}`}
                      >
                        {getRolIcon(usuario.rol)}
                        {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.estaActivo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.estaActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/configuracion/usuarios/${usuario.id}/editar`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Link>
                        {usuario.estaActivo && usuario.rol !== 'superadmin' && (
                          <button
                            onClick={() => handleDesactivar(usuario.id, usuario.nombreCompleto)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Roles del sistema:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Superadmin:</strong> Control total del sistema, gestión de usuarios</li>
              <li><strong>Admin:</strong> Gestión de socios, membresías, pagos y actividades</li>
              <li><strong>Recepcionista:</strong> Acceso de solo lectura y registro de asistencias</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
