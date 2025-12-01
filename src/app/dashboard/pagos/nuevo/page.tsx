'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pagosService, type MetodoPago } from '@/lib/api/pagos';
import { sociosService, type Socio } from '@/lib/api/socios';
import { membresiasService, type Membresia } from '@/lib/api/membresias';
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  UserCheck,
  Receipt,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';

const registrarPagoSchema = z.object({
  idSocio: z.number({ required_error: 'Selecciona un socio' }).min(1, 'Selecciona un socio'),
  idMembresia: z.number({ required_error: 'Selecciona una membresía' }).min(1, 'Selecciona una membresía'),
  idMetodoPago: z.number({ required_error: 'Selecciona un método de pago' }).min(1, 'Selecciona un método de pago'),
  monto: z.number({ required_error: 'Ingresa el monto' }).positive('El monto debe ser mayor a 0'),
  fechaPago: z.string().optional(),
});

type RegistrarPagoFormData = z.infer<typeof registrarPagoSchema>;

export default function NuevoPagoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [socios, setSocios] = useState<Socio[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [membresiasPendientes, setMembresiasPendientes] = useState<Membresia[]>([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(null);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState<Membresia | null>(null);
  const [searchSocio, setSearchSocio] = useState('');
  const [isLoadingSocios, setIsLoadingSocios] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrarPagoFormData>({
    resolver: zodResolver(registrarPagoSchema),
    defaultValues: {
      fechaPago: new Date().toISOString().split('T')[0],
    },
  });

  const montoIngresado = watch('monto');

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setIsLoadingData(true);
      const metodosData = await pagosService.obtenerMetodosPago();
      setMetodosPago(metodosData.filter(m => m.estaActivo));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setIsLoadingData(false);
    }
  };

  const buscarSocios = async () => {
    if (searchSocio.trim().length < 2) {
      setError('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      setIsLoadingSocios(true);
      setError('');
      const data = await sociosService.obtenerTodos({ search: searchSocio, estaActivo: true });
      setSocios(data);

      if (data.length === 0) {
        setError('No se encontraron socios con ese criterio de búsqueda');
      }
    } catch (error) {
      console.error('Error al buscar socios:', error);
      setError('Error al buscar socios. Por favor, intenta de nuevo.');
    } finally {
      setIsLoadingSocios(false);
    }
  };

  const seleccionarSocio = async (socio: Socio) => {
    setSocioSeleccionado(socio);
    setValue('idSocio', socio.id);
    setSocios([]);
    setSearchSocio(`${socio.nombre} ${socio.apellido} - ${socio.numeroSocio}`);
    setError('');

    // Cargar membresías pendientes del socio
    await cargarMembresiasImpagasSocio(socio.id);
  };

  const limpiarSocio = () => {
    setSocioSeleccionado(null);
    setValue('idSocio', 0);
    setSearchSocio('');
    setSocios([]);
    setMembresiasPendientes([]);
    setMembresiaSeleccionada(null);
    setValue('idMembresia', 0);
  };

  const cargarMembresiasImpagasSocio = async (idSocio: number) => {
    try {
      const membresias = await membresiasService.obtenerImpagasPorSocio(idSocio);
      setMembresiasPendientes(membresias);

      if (membresias.length === 0) {
        setError('Este socio no tiene membresías pendientes de pago');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error al cargar membresías:', error);
      setError('Error al cargar las membresías del socio');
    }
  };

  const seleccionarMembresia = (membresia: Membresia) => {
    setMembresiaSeleccionada(membresia);
    setValue('idMembresia', membresia.id);
    setValue('monto', membresia.saldo);
    setError('');
  };

  const onSubmit = async (data: RegistrarPagoFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const pagoRegistrado = await pagosService.registrar({
        idMembresia: data.idMembresia,
        idMetodoPago: data.idMetodoPago,
        monto: data.monto,
        fechaPago: data.fechaPago || undefined,
      });

      setSuccess('¡Pago registrado exitosamente!');

      setTimeout(() => {
        router.push(`/dashboard/pagos/${pagoRegistrado.id}/comprobante`);
      }, 1500);
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      setError(error.response?.data?.message || 'Error al registrar el pago');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/pagos"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Pagos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Pago</h1>
          <p className="text-gray-600 mt-2">Registra un pago de membresía para mantener el estado de cuenta al día</p>
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
                  <p className="text-sm text-gray-600">Busca el socio que realizará el pago</p>
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
                        <Loader2 className="w-5 h-5 animate-spin" />
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

          {/* Paso 2: Seleccionar Membresía */}
          {socioSeleccionado && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Seleccionar Membresía Pendiente</h2>
                    <p className="text-sm text-gray-600">Elige la membresía a la que se aplicará el pago</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {membresiasPendientes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">No hay membresías pendientes de pago</p>
                    <p className="text-sm text-gray-500 mt-1">Este socio está al día con sus pagos</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {membresiasPendientes.map((membresia) => (
                        <div
                          key={membresia.id}
                          onClick={() => seleccionarMembresia(membresia)}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            membresiaSeleccionada?.id === membresia.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="radio"
                                  checked={membresiaSeleccionada?.id === membresia.id}
                                  onChange={() => {}}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {membresia.periodoTexto || `${membresia.periodoMes}/${membresia.periodoAnio}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {membresia.actividades.length} actividad(es)
                                  </p>
                                </div>
                              </div>

                              {/* Desglose */}
                              <div className="ml-7 mt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total cargado:</span>
                                  <span className="font-medium">${membresia.totalCargado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pagado:</span>
                                  <span className="font-medium text-green-600">${membresia.totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                  <span className="font-semibold text-gray-900">Saldo pendiente:</span>
                                  <span className="font-bold text-red-600 text-lg">${membresia.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.idMembresia && (
                      <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.idMembresia.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Datos del Pago */}
          {membresiaSeleccionada && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Datos del Pago</h2>
                    <p className="text-sm text-gray-600">Ingresa el monto y método de pago</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Método de Pago *
                    </label>
                    <select
                      {...register('idMetodoPago', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un método</option>
                      {metodosPago.map((metodo) => (
                        <option key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idMetodoPago && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.idMetodoPago.message}
                      </p>
                    )}
                  </div>

                  {/* Fecha de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha de Pago
                    </label>
                    <input
                      {...register('fechaPago')}
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Monto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Monto a Pagar *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        {...register('monto', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={membresiaSeleccionada.saldo}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                      />
                    </div>
                    {errors.monto && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.monto.message}
                      </p>
                    )}

                    {/* Botones de monto rápido */}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setValue('monto', membresiaSeleccionada.saldo)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Pago Total (${membresiaSeleccionada.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('monto', membresiaSeleccionada.saldo / 2)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Mitad (${(membresiaSeleccionada.saldo / 2).toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                      </button>
                    </div>

                    {montoIngresado > 0 && montoIngresado <= membresiaSeleccionada.saldo && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Saldo restante después del pago:</strong> $
                          {(membresiaSeleccionada.saldo - montoIngresado).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        {(membresiaSeleccionada.saldo - montoIngresado) === 0 && (
                          <p className="text-sm text-green-700 font-semibold mt-1">
                            ✓ Esta membresía quedará completamente pagada
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen Total */}
          {membresiaSeleccionada && montoIngresado > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 mb-1">Monto del Pago</p>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-8 h-8" />
                    <p className="text-4xl font-bold">
                      ${montoIngresado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100">Para</p>
                  <p className="text-lg font-semibold">{socioSeleccionado?.nombre} {socioSeleccionado?.apellido}</p>
                  <p className="text-xs text-green-200 mt-1">
                    {membresiaSeleccionada.periodoTexto || `${membresiaSeleccionada.periodoMes}/${membresiaSeleccionada.periodoAnio}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          {membresiaSeleccionada && (
            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/dashboard/pagos"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando Pago...
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5" />
                    Registrar Pago y Generar Comprobante
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Se puede realizar un pago parcial o total de la membresía</li>
                <li>No se permite pagar más del saldo pendiente</li>
                <li>Se generará un comprobante automáticamente después del registro</li>
                <li>El estado de cuenta del socio se actualizará inmediatamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
