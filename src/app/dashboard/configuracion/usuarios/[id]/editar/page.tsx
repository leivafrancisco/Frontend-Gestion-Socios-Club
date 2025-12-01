'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usuariosService, type Usuario, ActualizarUsuarioDto } from '@/lib/api/usuarios';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
} from 'lucide-react';
import Link from 'next/link';

const actualizarUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El campo nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  apellido: z
    .string()
    .min(1, 'El campo apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .toLowerCase(),
  dni: z
    .string()
    .min(1, 'El DNI es obligatorio')
    .regex(/^\d+$/, 'El DNI solo puede contener números')
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede exceder 8 dígitos'),
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, 'La fecha de nacimiento debe ser anterior a hoy'),
  estaActivo: z.boolean(),
});

type ActualizarUsuarioFormData = z.infer<typeof actualizarUsuarioSchema>;

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = parseInt(params.id as string);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ActualizarUsuarioFormData>({
    resolver: zodResolver(actualizarUsuarioSchema),
  });

  useEffect(() => {
    cargarUsuario();
  }, [usuarioId]);

  const cargarUsuario = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await usuariosService.obtenerPorId(usuarioId);
      setUsuario(data);

      // Llenar el formulario con los datos del usuario
      setValue('nombre', data.nombre);
      setValue('apellido', data.apellido);
      setValue('email', data.email);
      setValue('dni', data.dni || '');
      setValue('fechaNacimiento', data.fechaNacimiento?.split('T')[0] || '');
      setValue('estaActivo', data.estaActivo);
    } catch (error: any) {
      console.error('Error al cargar usuario:', error);
      setError(
        error.response?.data?.message || 'Error al cargar los datos del usuario'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ActualizarUsuarioFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const actualizarData: ActualizarUsuarioDto = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        dni: data.dni || undefined,
        fechaNacimiento: data.fechaNacimiento || undefined,
        estaActivo: data.estaActivo,
      };

      await usuariosService.actualizar(usuarioId, actualizarData);
      setSuccess('¡Usuario actualizado exitosamente!');

      setTimeout(() => {
        router.push('/dashboard/configuracion/usuarios');
      }, 2000);
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      setError(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          'Error al actualizar el usuario'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockNonLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  const blockNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600 mb-6">No se pudo cargar la información del usuario.</p>
          <Link
            href="/dashboard/configuracion/usuarios"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/configuracion/usuarios"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Usuarios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-600 mt-2">
          Actualiza la información de <strong>{usuario.nombreCompleto}</strong>
        </p>
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

      {/* Información del Usuario (No Editable) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Información del Sistema</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Nombre de usuario:</span>
            <p className="font-medium text-blue-900">@{usuario.nombreUsuario}</p>
          </div>
          <div>
            <span className="text-blue-700">Rol:</span>
            <p className="font-medium text-blue-900 capitalize">{usuario.rol}</p>
          </div>
          <div>
            <span className="text-blue-700">Fecha de creación:</span>
            <p className="font-medium text-blue-900">
              {new Date(usuario.fechaCreacion).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          * El nombre de usuario y el rol no se pueden modificar. Para cambiar el rol, contacta a un superadmin.
        </p>
      </div>

      {/* Formulario de Edición */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...register('nombre')}
                  type="text"
                  onKeyPress={blockNonLetters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  {...register('apellido')}
                  type="text"
                  onKeyPress={blockNonLetters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pérez"
                />
                {errors.apellido && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.apellido.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan.perez@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* DNI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  DNI
                </label>
                <input
                  {...register('dni')}
                  type="text"
                  onKeyPress={blockNonNumeric}
                  maxLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678"
                />
                {errors.dni && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dni.message}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Nacimiento
                </label>
                <input
                  {...register('fechaNacimiento')}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fechaNacimiento.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estado del Usuario */}
          {usuario.rol !== 'superadmin' && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Estado del Usuario</h3>
              <div className="flex items-start gap-3">
                <input
                  {...register('estaActivo')}
                  type="checkbox"
                  id="estaActivo"
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="estaActivo" className="block text-sm font-medium text-gray-900 cursor-pointer">
                    Usuario Activo
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Si está desactivado, el usuario no podrá iniciar sesión en el sistema
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link
            href="/dashboard/configuracion/usuarios"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los usuarios superadmin no pueden ser desactivados</li>
              <li>El nombre de usuario no se puede modificar después de la creación</li>
              <li>Para cambiar la contraseña, contacta a un superadmin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
