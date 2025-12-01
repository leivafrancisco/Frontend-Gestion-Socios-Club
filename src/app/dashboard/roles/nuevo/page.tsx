'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { rolesService, CrearRolDto } from '@/lib/api/roles';

const rolSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_\s]+$/, 'Solo letras, números, guiones bajos y espacios'),
});

type RolFormData = z.infer<typeof rolSchema>;

export default function NuevoRolPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
  });

  const onSubmit = async (data: RolFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const rolData: CrearRolDto = {
        nombre: data.nombre.trim(),
      };

      await rolesService.crear(rolData);
      setSuccess(`Rol "${data.nombre}" creado exitosamente`);

      setTimeout(() => {
        router.push('/dashboard/roles');
      }, 2000);
    } catch (err: any) {
      console.error('Error completo:', err);
      const errorMessage =
        err.response?.data?.message || err.response?.data || err.message || 'Error al crear el rol';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/roles"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al listado
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Nuevo Rol</h1>
              <p className="text-sm text-gray-500 mt-1">
                Crea un nuevo rol personalizado para el sistema
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre del Rol *
            </label>
            <input
              type="text"
              id="nombre"
              {...register('nombre')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
              placeholder="Ej: Entrenador, Coordinador, Contador"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Los roles del sistema (superadmin, admin, recepcionista) están predefinidos y no pueden ser creados.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Nota importante</h3>
            <p className="text-sm text-blue-700">
              Este rol será creado como un rol personalizado. Para asignar permisos específicos,
              deberás configurarlos en el módulo de permisos del sistema.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Ejemplos de roles personalizados:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Entrenador:</strong> Para gestionar entrenamientos y asistencias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Coordinador:</strong> Para supervisar actividades del club</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Contador:</strong> Para gestionar aspectos financieros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Mantenimiento:</strong> Para gestionar instalaciones</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link
              href="/dashboard/roles"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Rol
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
