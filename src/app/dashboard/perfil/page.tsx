'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, Loader2, Lock, Mail } from 'lucide-react';
import { authService, ActualizarPerfilDto } from '@/lib/api/auth';

const perfilSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener letras'),
  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El apellido solo puede contener letras'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  dni: z
    .string()
    .min(1, 'El DNI es requerido')
    .regex(/^\d+$/, 'El DNI solo puede contener números')
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede exceder 8 dígitos'),
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, 'La fecha de nacimiento debe ser anterior a hoy'),
  passwordActual: z
    .string()
    .optional(),
  password: z
    .string()
    .optional(),
  confirmarPassword: z
    .string()
    .optional(),
}).refine((data) => {
  // Si se ingresa una nueva contraseña, validar que coincidan
  if (data.password || data.confirmarPassword) {
    return data.password === data.confirmarPassword;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
}).refine((data) => {
  // Si se ingresa una nueva contraseña, debe tener mínimo 6 caracteres
  if (data.password && data.password.length > 0) {
    return data.password.length >= 6;
  }
  return true;
}, {
  message: 'La contraseña debe tener al menos 6 caracteres',
  path: ['password'],
}).refine((data) => {
  // Si se ingresa una nueva contraseña, se requiere la contraseña actual
  if (data.password && data.password.length > 0) {
    return data.passwordActual && data.passwordActual.length > 0;
  }
  return true;
}, {
  message: 'Debes ingresar tu contraseña actual para cambiarla',
  path: ['passwordActual'],
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export default function PerfilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setIsLoading(true);
      
      // Obtener datos actualizados del backend en lugar de solo localStorage
      const usuario = await authService.obtenerUsuarioActual();

      if (usuario) {
        // Separar nombre completo en nombre y apellido
        const nombreCompleto = usuario.nombreCompleto.split(' ');
        const nombre = nombreCompleto[0] || '';
        const apellido = nombreCompleto.slice(1).join(' ') || '';

        setValue('nombre', nombre);
        setValue('apellido', apellido);
        setValue('email', usuario.email);

        // Cargar DNI y fecha de nacimiento si existen
        if (usuario.dni) {
          setValue('dni', usuario.dni);
        }
        if (usuario.fechaNacimiento) {
          // Convertir fecha a formato YYYY-MM-DD para el input date
          const fecha = new Date(usuario.fechaNacimiento);
          const fechaFormateada = fecha.toISOString().split('T')[0];
          setValue('fechaNacimiento', fechaFormateada);
        }
      }
    } catch (err: any) {
      setError('Error al cargar los datos del perfil');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PerfilFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const perfilData: ActualizarPerfilDto = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        dni: data.dni.trim(),
        fechaNacimiento: data.fechaNacimiento,
      };

      // Solo incluir contraseña si se ingresó
      if (data.password && data.password.length > 0) {
        perfilData.password = data.password;
        perfilData.passwordActual = data.passwordActual;
      }

      console.log('Enviando datos al backend:', perfilData);
      const usuarioActualizado = await authService.actualizarPerfil(perfilData);
      console.log('Respuesta del backend:', usuarioActualizado);

      setSuccess('Perfil actualizado exitosamente');

      // Limpiar campos de contraseña
      reset({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        dni: data.dni,
        fechaNacimiento: data.fechaNacimiento,
        passwordActual: '',
        password: '',
        confirmarPassword: '',
      });
      setShowPasswordFields(false);

      // Recargar datos del perfil
      setTimeout(() => {
        cargarPerfil();
      }, 1000);
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Error al actualizar el perfil';
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

  const usuario = authService.getUsuario();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-500 mt-1">
                Usuario: {usuario?.nombreUsuario} | Rol: {usuario?.rol}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Información Personal */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  {...register('nombre')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Juan"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Pérez"
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
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="usuario@email.com"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="12345678"
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
                  className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                <Lock className="w-5 h-5 inline mr-2" />
                Cambiar Contraseña
              </h2>
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showPasswordFields ? 'Cancelar cambio' : 'Cambiar contraseña'}
              </button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label htmlFor="passwordActual" className="block text-sm font-medium text-gray-700">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    id="passwordActual"
                    {...register('passwordActual')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  {errors.passwordActual && (
                    <p className="mt-1 text-sm text-red-600">{errors.passwordActual.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmarPassword"
                    {...register('confirmarPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                    placeholder="Repite la nueva contraseña"
                  />
                  {errors.confirmarPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmarPassword.message}</p>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  * La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
