'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usuariosService, type Usuario } from '@/lib/api/usuarios';
import {
  Users,
  Plus,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  UserX,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRol, setFilterRol] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuariosService.obtenerTodos();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (filterStatus === 'activos' && !usuario.estaActivo) return false;
    if (filterStatus === 'inactivos' && usuario.estaActivo) return false;
    if (filterRol && usuario.rol !== filterRol) return false;
    return true;
  });

  const getRolBadge = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'superadmin':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">👑 Superadmin</span>;
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">🛡️ Admin</span>;
      case 'recepcionista':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">📋 Recepcionista</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{rol}</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona los usuarios del sistema (solo superadmin)</p>
        </div>
        <Link
          href="/dashboard/usuarios/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Todos los roles</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{usuarios.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-xl font-bold text-purple-600">
              {usuarios.filter((u) => u.rol.toLowerCase() === 'admin').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recepcionistas</p>
            <p className="text-xl font-bold text-green-600">
              {usuarios.filter((u) => u.rol.toLowerCase() === 'recepcionista').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inactivos</p>
            <p className="text-xl font-bold text-red-600">
              {usuarios.filter((u) => !u.estaActivo).length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {usuario.nombreUsuario.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {usuario.nombreUsuario}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usuario.nombreCompleto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRolBadge(usuario.rol)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {usuario.estaActivo ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(usuario.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/usuarios/${usuario.id}/editar`}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                        </Link>
                        {usuario.estaActivo && usuario.rol.toLowerCase() !== 'superadmin' && (
                          <button
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Desactivar usuario"
                            onClick={async () => {
                              if (confirm('¿Está seguro de desactivar este usuario?')) {
                                try {
                                  await usuariosService.desactivar(usuario.id);
                                  cargarUsuarios();
                                } catch (error) {
                                  console.error('Error al desactivar usuario:', error);
                                  alert('Error al desactivar el usuario');
                                }
                              }
                            }}
                          >
                            <UserX className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
