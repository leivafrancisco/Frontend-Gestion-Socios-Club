'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { obtenerRolPorId, actualizarRol } from '@/lib/api/roles';

const rolSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_\s]+$/, 'Solo letras, números, guiones bajos y espacios'),
});

type RolFormData = z.infer<typeof rolSchema>;

export default function EditarRolPage() {
  const router = useRouter();
  const params = useParams();
  const rolId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolOriginal, setRolOriginal] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
  });

  useEffect(() => {
    cargarRol();
  }, [rolId]);

  const cargarRol = async () => {
    try {
      setLoading(true);
      const rol = await obtenerRolPorId(Number(rolId));
      setValue('nombre', rol.nombre);
      setRolOriginal(rol.nombre);
    } catch (error) {
      console.error('Error al cargar rol:', error);
      setError('Error al cargar el rol');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RolFormData) => {
    try {
      setGuardando(true);
      setError(null);

      await actualizarRol(Number(rolId), data);

      alert('Rol actualizado exitosamente');
      router.push('/dashboard/roles');
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      setError(error.response?.data?.message || 'Error al actualizar el rol');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando rol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/roles')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Volver a Roles
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Rol</h1>
              <p className="text-gray-600">Modificar el nombre del rol: {rolOriginal}</p>
            </div>
          </div>

          {/* Información importante */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Advertencia</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Los roles del sistema (superadmin, admin, recepcionista) no deben ser editados.
                  Solo modifica roles personalizados que hayas creado.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre del Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Rol *
              </label>
              <input
                {...register('nombre')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Entrenador, Coordinador..."
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/roles')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
