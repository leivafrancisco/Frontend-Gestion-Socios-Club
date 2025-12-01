'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sociosService, type Socio } from '@/lib/api/socios';
import { authService } from '@/lib/api/auth';
import {
  Users,
  Search,
  Plus,
  UserCircle,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Eye,
  UserX,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SociosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const usuario = authService.getUsuario();
    // Normalizar a minúsculas para evitar problemas de comparación
    setUserRole(usuario?.rol?.toLowerCase() || null);
  }, []);

  useEffect(() => {
    cargarSocios();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const cargarSocios = async () => {
    try {
      setIsLoading(true);
      const data = await sociosService.obtenerTodos({ search: searchTerm, page: 1, pageSize: 100 });
      setSocios(data);
    } catch (error) {
      console.error('Error al cargar socios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    cargarSocios();
  };

  const filteredSocios = socios.filter((socio) => {
    if (filterStatus === 'activos') return socio.estaActivo;
    if (filterStatus === 'inactivos') return !socio.estaActivo;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600">Gestiona los socios del club</p>
        </div>
        {/* Solo admin y superadmin pueden crear socios */}
        {userRole && ['admin', 'superadmin'].includes(userRole) && (
          <Link href="/dashboard/socios/nuevo" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Socio
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email o numero de socio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Buscar
            </button>
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{socios.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-xl font-bold text-green-600">{socios.filter(s => s.estaActivo).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inactivos</p>
            <p className="text-xl font-bold text-red-600">{socios.filter(s => !s.estaActivo).length}</p>
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
          ) : filteredSocios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron socios</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha Alta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSocios.map((socio) => (
                  <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {socio.nombre} {socio.apellido}
                          </p>
                          <p className="text-xs text-gray-500">#{socio.numeroSocio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        {socio.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {socio.dni || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(socio.fechaAlta), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {socio.estaActivo ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === socio.id ? null : socio.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {openMenuId === socio.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              {/* Solo admin y superadmin pueden editar */}
                              {userRole && ['admin', 'superadmin'].includes(userRole) && (
                                <Link
                                  href={`/dashboard/socios/${socio.id}/editar`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </Link>
                              )}
                              <button
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Eye className="w-4 h-4" />
                                Ver Detalle
                              </button>
                              {/* Solo admin y superadmin pueden desactivar */}
                              {userRole && ['admin', 'superadmin'].includes(userRole) && (
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <UserX className="w-4 h-4" />
                                  Desactivar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredSocios.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {filteredSocios.length} de {socios.length} socios
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                Anterior
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
