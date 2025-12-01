'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rolesService, type Rol } from '@/lib/api/roles';
import { Shield, Plus, Edit, Trash2, Users } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setIsLoading(true);
      const data = await rolesService.obtenerTodos();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRolBadgeColor = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'recepcionista':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRolIcon = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'superadmin':
        return '👑';
      case 'admin':
        return '🛡️';
      case 'recepcionista':
        return '📋';
      default:
        return '👤';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600">Gestiona los roles y permisos del sistema</p>
        </div>
        <Link
          href="/dashboard/configuracion/roles/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Rol
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Roles</p>
            <p className="text-xl font-bold text-gray-900">{roles.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Roles de Sistema</p>
            <p className="text-xl font-bold text-purple-600">
              {roles.filter((r) => ['superadmin', 'admin', 'recepcionista'].includes(r.nombre.toLowerCase())).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Roles Personalizados</p>
            <p className="text-xl font-bold text-green-600">
              {roles.filter((r) => !['superadmin', 'admin', 'recepcionista'].includes(r.nombre.toLowerCase())).length}
            </p>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay roles registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {roles.map((rol) => (
              <div
                key={rol.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getRolIcon(rol.nombre)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{rol.nombre}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRolBadgeColor(
                          rol.nombre
                        )} mt-1`}
                      >
                        Rol de {rol.nombre.toLowerCase() === 'superadmin' ? 'sistema' : 'sistema'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    {rol.nombre.toLowerCase() === 'superadmin' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Acceso completo al sistema</li>
                        <li>Gestión de usuarios</li>
                        <li>Configuración del sistema</li>
                      </ul>
                    )}
                    {rol.nombre.toLowerCase() === 'admin' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Gestión de socios</li>
                        <li>Procesamiento de pagos</li>
                        <li>Generación de reportes</li>
                      </ul>
                    )}
                    {rol.nombre.toLowerCase() === 'recepcionista' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Consulta de socios</li>
                        <li>Registro de asistencias</li>
                        <li>Vista limitada</li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/configuracion/roles/${rol.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    disabled={['superadmin', 'admin', 'recepcionista'].includes(rol.nombre.toLowerCase())}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
