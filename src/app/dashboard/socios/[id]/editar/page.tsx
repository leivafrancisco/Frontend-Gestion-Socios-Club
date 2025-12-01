'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { sociosService, ActualizarSocioDto, Socio } from '@/lib/api/socios';

const socioSchema = z.object({
  nombre: z
    .string()
    .min(2, '')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener letras'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El apellido solo puede contener letras'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  dni: z
    .string()
    .min(1, 'El campo DNI es obligatorio')
    .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos')
    .max(8, 'El DNI no puede exceder 8 dígitos'),
  fechaNacimiento: z.string().min(1, 'El campo fecha de nacimiento es obligatorio'),
});

type SocioFormData = z.infer<typeof socioSchema>;

export default function EditarSocioPage() {
  const router = useRouter();
  const params = useParams();
  const socioId = parseInt(params.id as string);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [socio, setSocio] = useState<Socio | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
  });

  useEffect(() => {
    cargarSocio();
  }, [socioId]);

  const cargarSocio = async () => {
    try {
      setIsLoading(true);
      const data = await sociosService.obtenerPorId(socioId);
      setSocio(data);

      // Pre-llenar el formulario
      setValue('nombre', data.nombre);
      setValue('apellido', data.apellido);
      setValue('email', data.email);
      setValue('dni', data.dni || '');
      setValue('fechaNacimiento', data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '');
    } catch (err: any) {
      setError('Error al cargar los datos del socio');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SocioFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const socioData: ActualizarSocioDto = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        dni: data.dni && data.dni.trim() !== '' ? data.dni.trim() : undefined,
        fechaNacimiento: data.fechaNacimiento || undefined,
      };

      await sociosService.actualizar(socioId, socioData);
      setSuccess(`Socio actualizado exitosamente`);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/socios');
      }, 2000);
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      const errorMessage =
        err.response?.data?.message || err.response?.data || err.message || 'Error al actualizar el socio';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          No se encontró el socio
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/socios"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al listado
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Editar Socio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Socio N° {socio.numeroSocio}
          </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                {...register('nombre')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
                placeholder="Ej: Juan"
                onKeyPress={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                {...register('apellido')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
                placeholder="Ej: Pérez"
                onKeyPress={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.apellido && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
                placeholder="Ej: juan@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                DNI *
              </label>
              <input
                type="text"
                id="dni"
                {...register('dni')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
                placeholder="Ej: 12345678"
                maxLength={8}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.dni && (
                <p className="mt-1 text-sm text-red-600">{errors.dni.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                {...register('fechaNacimiento')}
                className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.fechaNacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link
              href="/dashboard/socios"
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
