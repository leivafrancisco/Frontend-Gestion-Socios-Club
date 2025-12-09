'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  Search,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Activity,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { membresiasService, CrearMembresiaDto } from '@/lib/api/membresias';
import { sociosService, type Socio } from '@/lib/api/socios';
import { actividadesService, type Actividad } from '@/lib/api/actividades';
import { pagosService, type MetodoPago } from '@/lib/api/pagos';
import { authService } from '@/lib/api/auth';

const membresiaSchema = z.object({
  idSocio: z.number().min(1, 'Debe seleccionar un socio'),
  fechaInicio: z.string().min(1, 'Debe ingresar la fecha de inicio'),
  fechaFin: z.string().min(1, 'Debe ingresar la fecha de fin'),
  actividadesIds: z.array(z.number()).min(1, 'Debe seleccionar al menos una actividad'),
  costoTotal: z.number().min(0.01, 'El monto total debe ser mayor a 0'),
  // Campos de pago inicial
  monto: z.number().min(0.01, 'El monto del pago debe ser mayor a cero'),
  idMetodoPago: z.number().min(1, 'Debe seleccionar un método de pago'),
}).refine((data) => {
  // Validar que la fecha de inicio no sea anterior a hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaInicio = new Date(data.fechaInicio + 'T00:00:00');
  return fechaInicio >= hoy;
}, {
  message: 'La fecha de inicio no puede ser anterior a la fecha actual',
  path: ['fechaInicio'],
}).refine((data) => {
  // Validar que la fecha de fin sea posterior a la fecha de inicio
  const fechaInicio = new Date(data.fechaInicio + 'T00:00:00');
  const fechaFin = new Date(data.fechaFin + 'T00:00:00');
  return fechaFin > fechaInicio;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin'],
}).refine((data) => {
  // Validar que el monto no sea mayor que el costo total
  return data.monto <= data.costoTotal;
}, {
  message: 'El monto del pago no puede ser mayor al costo total de la membresía',
  path: ['monto'],
});

type MembresiaFormData = z.infer<typeof membresiaSchema>;

export default function NuevaMembresiaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [socios, setSocios] = useState<Socio[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedActividades, setSelectedActividades] = useState<number[]>([]);
  const [searchSocio, setSearchSocio] = useState('');
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(null);
  const [isLoadingSocios, setIsLoadingSocios] = useState(false);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);

  const currentDate = new Date();
  const [fechaInicio, setFechaInicio] = useState(currentDate.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<MembresiaFormData>({
    resolver: zodResolver(membresiaSchema),
    defaultValues: {
      fechaInicio: currentDate.toISOString().split('T')[0],
      fechaFin: '',
      actividadesIds: [],
      costoTotal: undefined as any, // Start undefined to avoid validation errors
    },
  });

  const idSocioWatch = watch('idSocio');

  useEffect(() => {
    cargarActividades();
    cargarMetodosPago();
  }, []);

  const cargarActividades = async () => {
    try {
      const data = await actividadesService.obtenerTodas();
      setActividades(data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setError('Error al cargar las actividades disponibles');
    }
  };

  const cargarMetodosPago = async () => {
    try {
      const data = await pagosService.obtenerMetodosPago();
      setMetodosPago(data.filter(m => m.estaActivo));
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      setError('Error al cargar los métodos de pago disponibles');
    }
  };

  const buscarSocios = async () => {
    if (searchSocio.trim().length < 2) {
      setError('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      setIsLoadingSocios(true);
      setError(null);
      console.log('Buscando socios con criterio:', searchSocio);
      const data = await sociosService.obtenerTodos({ search: searchSocio, estaActivo: true });
      console.log('Socios encontrados:', data);
      setSocios(data);

      if (data.length === 0) {
        setError('No se encontraron socios con ese criterio de búsqueda');
      }
    } catch (error: any) {
      console.error('Error completo al buscar socios:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);

      let errorMessage = 'Error al buscar socios. ';

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        errorMessage += `Código de error: ${error.response.status}. `;
        if (error.response.data?.message) {
          errorMessage += error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        errorMessage += 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else {
        // Algo pasó al configurar la petición
        errorMessage += error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoadingSocios(false);
    }
  };

  const seleccionarSocio = (socio: Socio) => {
    setSocioSeleccionado(socio);
    setValue('idSocio', socio.id);
    setSocios([]);
    setSearchSocio(`${socio.nombre} ${socio.apellido} - ${socio.numeroSocio}`);
    setError(null);
  };

  const limpiarSocio = () => {
    setSocioSeleccionado(null);
    setValue('idSocio', 0);
    setSearchSocio('');
    setSocios([]);
  };

  const toggleActividad = (actividadId: number) => {
    const newSelected = selectedActividades.includes(actividadId)
      ? selectedActividades.filter((id) => id !== actividadId)
      : [...selectedActividades, actividadId];

    setSelectedActividades(newSelected);
    setValue('actividadesIds', newSelected);

    // Calcular el precio sugerido basado en las actividades seleccionadas
    const precioSugerido = newSelected.reduce((total, id) => {
      const actividad = actividades.find(a => a.id === id);
      return total + (actividad?.precio || 0);
    }, 0);

    // Actualizar automáticamente el campo costoTotal con el precio sugerido
    setValue('costoTotal', precioSugerido, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });

    // Actualizar automáticamente el monto del pago con el precio sugerido (pago completo por defecto)
    setValue('monto', precioSugerido, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });

    setError(null);
  };

  // Calcular precio mensual sugerido (suma de todas las actividades seleccionadas)
  // Esto es solo informativo para ayudar al administrador
  const precioMensualSugerido = selectedActividades.reduce((total, actividadId) => {
    const actividad = actividades.find(a => a.id === actividadId);
    return total + (actividad?.precio || 0);
  }, 0);

  const onSubmit = async (data: MembresiaFormData) => {
    console.log('=== INICIO onSubmit ===');
    console.log('Data recibida del formulario:', data);

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Obtener usuario autenticado
      const usuario = authService.getUsuario();
      if (!usuario) {
        throw new Error('No hay usuario autenticado');
      }

      // Validar campos de pago
      if (!data.monto || data.monto <= 0) {
        setError('El monto del pago debe ser mayor a cero');
        setIsSubmitting(false);
        return;
      }

      if (!data.idMetodoPago) {
        setError('Debe seleccionar un método de pago');
        setIsSubmitting(false);
        return;
      }

      if (data.monto > data.costoTotal) {
        setError('El monto del pago no puede ser mayor al costo total de la membresía');
        setIsSubmitting(false);
        return;
      }

      const membresiaData: CrearMembresiaDto = {
        idSocio: data.idSocio,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        idsActividades: data.actividadesIds,
        costoTotal: data.costoTotal,
        // Campos de pago inicial
        monto: data.monto,
        idMetodoPago: data.idMetodoPago,
        idUsuarioProcesa: usuario.id,
      };

      console.log('Data a enviar al backend:', membresiaData);
      console.log('Data a enviar (JSON):', JSON.stringify(membresiaData, null, 2));

      await membresiasService.crear(membresiaData);

      console.log('✅ Membresía creada exitosamente con pago inicial');
      setSuccess('¡Membresía creada exitosamente con el pago inicial registrado!');

      setTimeout(() => {
        router.push('/dashboard/membresias');
      }, 1500);
    } catch (err: any) {
      console.error('❌ ERROR al crear membresía:', err);
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);

      // Manejar error con mensaje explícito del backend
      let errorMessage = 'Error al crear la membresía';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('=== FIN onSubmit ===');
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/membresias"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Membresías
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Membresía</h1>
          <p className="text-gray-600 mt-2">Asigna actividades a un socio para el período especificado</p>
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
          {/* Paso 1: Seleccionar Socio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Seleccionar Socio</h2>
                  <p className="text-sm text-gray-600">Busca y selecciona el socio para esta membresía</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!socioSeleccionado ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por nombre, DNI o número de socio *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchSocio}
                        onChange={(e) => setSearchSocio(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            buscarSocios();
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Ej: Juan Pérez, 12345678, SOC-0001..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={buscarSocios}
                      disabled={isLoadingSocios}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isLoadingSocios ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </>
                      ) : (
                        'Buscar'
                      )}
                    </button>
                  </div>

                  {/* Lista de socios encontrados */}
                  {socios.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {socios.map((socio) => (
                        <button
                          key={socio.id}
                          type="button"
                          onClick={() => seleccionarSocio(socio)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {socio.nombre} {socio.apellido}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                #{socio.numeroSocio} • {socio.email} {socio.dni && `• DNI: ${socio.dni}`}
                              </p>
                            </div>
                            <UserCheck className="w-5 h-5 text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 rounded-full p-2">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {socioSeleccionado.nombre} {socioSeleccionado.apellido}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Número: {socioSeleccionado.numeroSocio} • {socioSeleccionado.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={limpiarSocio}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}

              {errors.idSocio && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.idSocio.message}
                </p>
              )}
            </div>
          </div>

          {/* Paso 2: Período */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Período de la Membresía</h2>
                  <p className="text-sm text-gray-600">Define el rango de fechas de la membresía</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="fechaInicio"
                    {...register('fechaInicio')}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fechaInicio && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaInicio.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    id="fechaFin"
                    {...register('fechaFin')}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fechaFin && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaFin.message}</p>
                  )}
                </div>
              </div>

              {fechaInicio && fechaFin && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Período seleccionado:</strong> Desde {new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-AR')} hasta {new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Paso 3: Actividades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Seleccionar Actividades</h2>
                  <p className="text-sm text-gray-600">Elige las actividades que incluirá esta membresía</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {actividades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay actividades disponibles</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actividades.map((actividad) => (
                      <div
                        key={actividad.id}
                        onClick={() => toggleActividad(actividad.id)}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedActividades.includes(actividad.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedActividades.includes(actividad.id)}
                                onChange={() => {}}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <p className="font-semibold text-gray-900">{actividad.nombre}</p>
                            </div>
                            {actividad.descripcion && (
                              <p className="text-xs text-gray-600 mt-2 ml-7">{actividad.descripcion}</p>
                            )}
                          </div>
                          <div className="ml-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                              ${actividad.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.actividadesIds && (
                    <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.actividadesIds.message}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Paso 4: Monto Total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Costo Total de la Membresía</h2>
                  <p className="text-sm text-gray-600">Ingresa el monto total que se cobrará por esta membresía</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Información del precio sugerido */}
              {selectedActividades.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Precio mensual sugerido:</p>
                      <p className="text-xl font-bold text-blue-900">
                        ${precioMensualSugerido.toLocaleString('es-AR', { minimumFractionDigits: 2 })} / mes
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Basado en las {selectedActividades.length} {selectedActividades.length === 1 ? 'actividad seleccionada' : 'actividades seleccionadas'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Campo de monto total */}
              <div>
                <label htmlFor="costoTotal" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Monto Total a Cobrar *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                    $
                  </span>
                  <Controller
                    name="costoTotal"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        id="costoTotal"
                        step="0.01"
                        min="0.01"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === null) {
                            field.onChange(undefined);
                            return;
                          }
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? undefined : numValue);
                        }}
                        onBlur={field.onBlur}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        name={field.name}
                        ref={field.ref}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>
                {errors.costoTotal && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.costoTotal.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Este es el monto total que el socio deberá pagar por toda la membresía.
                </p>
              </div>
            </div>
          </div>

          {/* Paso 5: Datos del Pago Inicial */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 border-b border-green-600">
              <div className="flex items-center gap-3">
                <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Pago Inicial</h2>
                  <p className="text-sm text-green-50">Registra el pago inicial para activar la membresía</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Alerta informativa */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">La membresía se creará con estado "Activa"</p>
                    <p>
                      Al crear la membresía, se registrará automáticamente el pago inicial. Puedes ingresar el monto completo o un pago parcial (seña/adelanto).
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo Monto del Pago */}
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Monto del Pago Inicial *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                    $
                  </span>
                  <Controller
                    name="monto"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        id="monto"
                        step="0.01"
                        min="0.01"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === null) {
                            field.onChange(undefined);
                            return;
                          }
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? undefined : numValue);
                        }}
                        onBlur={field.onBlur}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        name={field.name}
                        ref={field.ref}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>
                {errors.monto && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.monto.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Puede ser igual o menor al costo total. Si es menor, el saldo pendiente podrá pagarse después.
                </p>
              </div>

              {/* Campo Método de Pago */}
              <div>
                <label htmlFor="idMetodoPago" className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Método de Pago *
                </label>
                <select
                  id="idMetodoPago"
                  {...register('idMetodoPago', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccione un método de pago</option>
                  {metodosPago.map((metodo) => (
                    <option key={metodo.id} value={metodo.id}>
                      {metodo.nombre}
                    </option>
                  ))}
                </select>
                {errors.idMetodoPago && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.idMetodoPago.message}
                  </p>
                )}
              </div>

              {/* Resumen del pago */}
              {watch('costoTotal') && watch('monto') && watch('monto') <= watch('costoTotal') && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pago</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo Total:</span>
                      <span className="font-semibold text-gray-900">
                        ${watch('costoTotal').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pago Inicial:</span>
                      <span className="font-semibold text-green-600">
                        ${watch('monto').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-600">Saldo Pendiente:</span>
                      <span className={`font-bold ${(watch('costoTotal') - watch('monto')) === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        ${(watch('costoTotal') - watch('monto')).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(watch('costoTotal') - watch('monto')) === 0 && (
                      <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Pago completo - Membresía totalmente paga</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/dashboard/membresias"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !socioSeleccionado || selectedActividades.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando Membresía...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Membresía
                </>
              )}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Información Importante:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>La membresía se creará con estado <strong>"Activa"</strong> inmediatamente</li>
                <li>El pago inicial se registrará automáticamente al crear la membresía</li>
                <li>Puedes registrar un pago completo o parcial (seña/adelanto)</li>
                <li>Si hay saldo pendiente, podrás registrar pagos adicionales después</li>
                <li>No se permite crear membresías con fechas que se solapen para el mismo socio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
