'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { asistenciaService, VerificarAsistenciaDto } from '@/lib/api/asistencias';

export default function MarcarAsistenciaPage() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [verificacion, setVerificacion] = useState<VerificarAsistenciaDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState('');

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dni.trim()) {
      setError('Por favor ingrese un DNI');
      return;
    }

    setLoading(true);
    setError('');
    setVerificacion(null);

    try {
      const resultado = await asistenciaService.verificarEstadoSocio(dni);
      setVerificacion(resultado);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar el estado del socio');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarAsistencia = async () => {
    if (!verificacion || !verificacion.tieneAcceso) return;

    setRegistrando(true);
    setError('');

    try {
      await asistenciaService.registrarAsistencia(dni);
      alert('¡Asistencia registrada exitosamente!');

      // Limpiar formulario
      setDni('');
      setVerificacion(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la asistencia');
    } finally {
      setRegistrando(false);
    }
  };

  const handleLimpiar = () => {
    setDni('');
    setVerificacion(null);
    setError('');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'AL DIA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SALDO PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SIN MEMBRESIA VIGENTE':
      case 'INACTIVO':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marcar Asistencia</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-600 hover:text-gray-900"
        >
          Volver
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleVerificar} className="space-y-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
              DNI del Socio *
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={8}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el DNI"
                disabled={loading || registrando}
              />
              <button
                type="submit"
                disabled={loading || registrando || !dni.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              {verificacion && (
                <button
                  type="button"
                  onClick={handleLimpiar}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {verificacion && (
          <div className="mt-6 space-y-4">
            <div className={`p-6 rounded-lg border-2 ${getEstadoColor(verificacion.estadoMembresia)}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Estado de Membresía</h3>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-white bg-opacity-50">
                    {verificacion.estadoMembresia}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Socio:</span>
                    <p className="text-gray-700">{verificacion.nombreSocio}</p>
                  </div>
                  <div>
                    <span className="font-medium">N° Socio:</span>
                    <p className="text-gray-700">{verificacion.numeroSocio}</p>
                  </div>
                  <div>
                    <span className="font-medium">DNI:</span>
                    <p className="text-gray-700">{verificacion.dni}</p>
                  </div>
                  {verificacion.fechaVigenciaHasta && (
                    <div>
                      <span className="font-medium">Vigencia hasta:</span>
                      <p className="text-gray-700">
                        {new Date(verificacion.fechaVigenciaHasta).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  )}
                </div>

                {verificacion.saldoPendiente !== undefined && verificacion.saldoPendiente > 0 && (
                  <div className="pt-2 border-t border-current border-opacity-20">
                    <span className="font-medium">Saldo Pendiente:</span>
                    <p className="text-lg font-bold">${verificacion.saldoPendiente.toFixed(2)}</p>
                  </div>
                )}

                {verificacion.actividades && verificacion.actividades.length > 0 && (
                  <div className="pt-2 border-t border-current border-opacity-20">
                    <span className="font-medium">Actividades:</span>
                    <ul className="mt-1 list-disc list-inside">
                      {verificacion.actividades.map((actividad, index) => (
                        <li key={index} className="text-gray-700">{actividad}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-current border-opacity-20">
                  <p className="text-base font-semibold">{verificacion.mensaje}</p>
                </div>
              </div>
            </div>

            {verificacion.tieneAcceso && (
              <button
                onClick={handleRegistrarAsistencia}
                disabled={registrando}
                className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {registrando ? 'Registrando...' : '✓ Registrar Asistencia'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
