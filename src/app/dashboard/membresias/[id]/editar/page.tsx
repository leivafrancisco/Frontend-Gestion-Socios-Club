'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { membresiasService, type Membresia, type ActualizarMembresiaDto } from '@/lib/api/membresias';
import { actividadesService, type Actividad } from '@/lib/api/actividades';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit,
  Activity as ActivityIcon,
} from 'lucide-react';
import Link from 'next/link';

const actualizarMembresiaSchema = z.object({
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().min(1, 'La fecha de fin es requerida'),
  idsActividades: z.array(z.number()).min(1, 'Debes seleccionar al menos una actividad'),
}).refine((data) => {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);
  return fin > inicio;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin'],
});

type ActualizarMembresiaFormData = z.infer<typeof actualizarMembresiaSchema>;

export default function EditarMembresiaPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActualizarMembresiaFormData>({
    resolver: zodResolver(actualizarMembresiaSchema),
  });

  const idsActividadesSeleccionadas = watch('idsActividades') || [];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoadingData(true);
      const id = Number(params.id);

      if (!id || isNaN(id)) {
        setError('ID de membresía inválido');
        return;
      }

      const [membresiaData, actividadesData] = await Promise.all([
        membresiasService.obtenerPorId(id),
        actividadesService.obtenerTodas(),
      ]);

      setMembresia(membresiaData);
      // Filtrar solo las activas si existe el campo estaActivo
      setActividades(actividadesData.filter(a => a.estaActivo !== false));

      // Establecer valores iniciales del formulario
      setValue('fechaInicio', membresiaData.fechaInicio.split('T')[0]);
      setValue('fechaFin', membresiaData.fechaFin.split('T')[0]);
      setValue('idsActividades', membresiaData.actividades.map(a => a.idActividad));
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos de la membresía');
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleActividad = (idActividad: number) => {
    const nuevasActividades = idsActividadesSeleccionadas.includes(idActividad)
      ? idsActividadesSeleccionadas.filter(id => id !== idActividad)
      : [...idsActividadesSeleccionadas, idActividad];

    setValue('idsActividades', nuevasActividades);
    setError('');
  };

  const calcularNuevoTotal = (): number => {
    return actividades
      .filter(a => idsActividadesSeleccionadas.includes(a.id))
      .reduce((sum, a) => sum + a.precio, 0);
  };

  const onSubmit = async (data: ActualizarMembresiaFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const id = Number(params.id);

      const datosActualizacion: ActualizarMembresiaDto = {
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        idsActividades: data.idsActividades,
      };

      await membresiasService.actualizar(id, datosActualizacion);

      setSuccess('¡Membresía actualizada exitosamente!');

      setTimeout(() => {
        router.push(`/dashboard/membresias/${id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error al actualizar membresía:', error);
      setError(error.response?.data?.message || 'Error al actualizar la membresía');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!membresia) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">No se encontró la membresía</p>
          <Link
            href="/dashboard/membresias"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Membresías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/membresias/${membresia.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al Detalle
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Membresía</h1>
          <p className="text-gray-600 mt-2">
            Membresía de {membresia.nombreSocio} (#{membresia.numeroSocio})
          </p>
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

        {/* Información Importante */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Información Importante</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Los pagos realizados no se verán afectados. Si el nuevo total es mayor, se agregará saldo pendiente.
                Si es menor, el saldo se reducirá proporcionalmente.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Total actual:</strong> ${membresia.totalCargado.toFixed(2)} |
                <strong> Total pagado:</strong> ${membresia.totalPagado.toFixed(2)} |
                <strong> Saldo actual:</strong> ${membresia.saldo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Período de Membresía */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Período de Membresía</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  {...register('fechaInicio')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.fechaInicio && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaInicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  {...register('fechaFin')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.fechaFin && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaFin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actividades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ActivityIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Actividades</h2>
            </div>

            {errors.idsActividades && (
              <p className="mb-4 text-sm text-red-600">{errors.idsActividades.message}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actividades.map((actividad) => {
                const estaSeleccionada = idsActividadesSeleccionadas.includes(actividad.id);
                return (
                  <div
                    key={actividad.id}
                    onClick={() => toggleActividad(actividad.id)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      estaSeleccionada
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{actividad.nombre}</h3>
                      {estaSeleccionada && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    {actividad.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">{actividad.descripcion}</p>
                    )}
                    <p className="text-lg font-bold text-blue-600">
                      ${actividad.precio.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen del Nuevo Total */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Cambios</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Actual:</span>
                <span className="font-semibold text-gray-900">
                  ${membresia.totalCargado.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Nuevo Total:</span>
                <span className="font-semibold text-blue-600">
                  ${calcularNuevoTotal().toFixed(2)}
                </span>
              </div>
              <div className="border-t-2 border-blue-300 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Diferencia:</span>
                  <span className={`font-bold text-lg ${
                    calcularNuevoTotal() - membresia.totalCargado > 0
                      ? 'text-orange-600'
                      : calcularNuevoTotal() - membresia.totalCargado < 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}>
                    {calcularNuevoTotal() - membresia.totalCargado > 0 ? '+' : ''}
                    ${(calcularNuevoTotal() - membresia.totalCargado).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  Actualizar Membresía
                </>
              )}
            </button>
            <Link
              href={`/dashboard/membresias/${membresia.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
