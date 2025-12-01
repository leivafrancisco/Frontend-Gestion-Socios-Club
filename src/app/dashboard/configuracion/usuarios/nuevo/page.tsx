'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usuariosService, CrearUsuarioDto } from '@/lib/api/usuarios';
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const usuarioSchema = z.object({
  // Datos personales
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

  // Datos de usuario
  nombreUsuario: z
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  confirmPassword: z.string(),

  // Rol
  rol: z.enum(['admin', 'recepcionista'], {
    required_error: 'Debes seleccionar un rol',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    mode: 'onChange',
  });

  const handleNextStep = async () => {
    // Validar campos del paso actual
    const fieldsToValidate: (keyof UsuarioFormData)[] =
      currentStep === 1
        ? ['nombre', 'apellido', 'email', 'dni', 'fechaNacimiento', 'nombreUsuario', 'password', 'confirmPassword']
        : [];

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const usuarioData: CrearUsuarioDto = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        dni: data.dni || undefined,
        fechaNacimiento: data.fechaNacimiento || undefined,
        nombreUsuario: data.nombreUsuario.trim(),
        password: data.password,
        rol: data.rol,
      };

      await usuariosService.crear(usuarioData);
      setSuccess('¡Usuario creado exitosamente!');

      setTimeout(() => {
        router.push('/dashboard/configuracion/usuarios');
      }, 2000);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      setError(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          'Error al crear el usuario'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/configuracion/usuarios"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Usuarios
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
          <p className="text-gray-600 mt-2">
            Completa los datos para crear un nuevo usuario del sistema
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= 1
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  1
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div
                    className={`h-full transition-all ${
                      currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">Datos Personales</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-end">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= 2
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  2
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">Asignar Rol</p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Paso 1: Datos Personales y Credenciales */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Datos Personales y Credenciales</h2>
                    <p className="text-sm text-gray-600">Ingresa la información personal y credenciales de acceso</p>
                  </div>
                </div>
              </div>

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

                {/* Credenciales de Acceso */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Credenciales de Acceso
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Nombre de Usuario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Usuario *
                      </label>
                      <input
                        {...register('nombreUsuario')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="juanperez"
                      />
                      {errors.nombreUsuario && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.nombreUsuario.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Este será el usuario para iniciar sesión en el sistema
                      </p>
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Asignar Rol */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Asignar Rol</h2>
                    <p className="text-sm text-gray-600">
                      Selecciona el rol que tendrá este usuario en el sistema
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Resumen del usuario */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Usuario a crear:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre completo:</span>
                      <p className="font-medium">
                        {getValues('nombre')} {getValues('apellido')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Usuario:</span>
                      <p className="font-medium">@{getValues('nombreUsuario')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{getValues('email')}</p>
                    </div>
                    {getValues('dni') && (
                      <div>
                        <span className="text-gray-600">DNI:</span>
                        <p className="font-medium">{getValues('dni')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selección de Rol */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecciona el rol *
                  </label>

                  {/* Opción Admin */}
                  <div
                    className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      getValues('rol') === 'admin'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      const event = { target: { value: 'admin' } };
                      register('rol').onChange(event as any);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        {...register('rol')}
                        type="radio"
                        value="admin"
                        className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Administrador</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Acceso completo para gestionar el club
                        </p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Gestión de socios y membresías
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Registro de pagos y reportes financieros
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Gestión de actividades
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Registro de asistencias
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Opción Recepcionista */}
                  <div
                    className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      getValues('rol') === 'recepcionista'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      const event = { target: { value: 'recepcionista' } };
                      register('rol').onChange(event as any);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        {...register('rol')}
                        type="radio"
                        value="recepcionista"
                        className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="w-5 h-5 text-green-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Recepcionista</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Acceso limitado para recepción
                        </p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Consulta de información de socios
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Registro de asistencias
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Asignar/remover actividades a membresías
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-700">Sin acceso a pagos ni gestión de datos</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {errors.rol && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.rol.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-4">
            {currentStep === 1 ? (
              <Link
                href="/dashboard/configuracion/usuarios"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </Link>
            ) : (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            )}

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Crear Usuario
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Información adicional */}
        {currentStep === 1 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>El nombre de usuario debe ser único en el sistema</li>
                  <li>La contraseña debe tener al menos 6 caracteres</li>
                  <li>El email será utilizado para comunicaciones del sistema</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
