'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2, Search, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { membresiasService, type Membresia, AsignarActividadDto, RemoverActividadDto } from '@/lib/api/membresias';
import { sociosService, type Socio } from '@/lib/api/socios';
import { actividadesService, type Actividad } from '@/lib/api/actividades';

export default function AsignarActividadPage() {
  const router = useRouter();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState<Membresia | null>(null);

  const [searchSocio, setSearchSocio] = useState('');
  const [isLoadingSocios, setIsLoadingSocios] = useState(false);
  const [isLoadingMembresias, setIsLoadingMembresias] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      const data = await actividadesService.obtenerTodas();
      setActividades(data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    }
  };

  const buscarSocios = async () => {
    if (searchSocio.trim().length < 2) return;

    try {
      setIsLoadingSocios(true);
      const data = await sociosService.obtenerTodos({ search: searchSocio, estaActivo: true });
      setSocios(data);
    } catch (error) {
      console.error('Error al buscar socios:', error);
    } finally {
      setIsLoadingSocios(false);
    }
  };

  const cargarMembresias = async (socioId: number) => {
    try {
      setIsLoadingMembresias(true);
      const data = await membresiasService.obtenerTodas(socioId);
      setMembresias(data);
      setMembresiaSeleccionada(null);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
    } finally {
      setIsLoadingMembresias(false);
    }
  };

  const handleAsignarActividad = async (actividadId: number) => {
    if (!membresiaSeleccionada) {
      setError('Debe seleccionar una membresía primero');
      return;
    }

    // Verificar si ya está asignada
    if (membresiaSeleccionada.actividades.some(a => a.idActividad === actividadId)) {
      setError('Esta actividad ya está asignada a la membresía');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const datos: AsignarActividadDto = {
        idMembresia: membresiaSeleccionada.id,
        idActividad: actividadId,
      };

      await membresiasService.asignarActividad(datos);
      setSuccess('Actividad asignada exitosamente');

      // Recargar la membresía
      const membresiaActualizada = await membresiasService.obtenerPorId(membresiaSeleccionada.id);
      setMembresiaSeleccionada(membresiaActualizada);

      // Actualizar también la lista de membresías
      const indexMembresia = membresias.findIndex(m => m.id === membresiaSeleccionada.id);
      if (indexMembresia !== -1) {
        const nuevasMembresias = [...membresias];
        nuevasMembresias[indexMembresia] = membresiaActualizada;
        setMembresias(nuevasMembresias);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error al asignar la actividad';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoverActividad = async (actividadId: number) => {
    if (!membresiaSeleccionada) return;

    if (!confirm('¿Está seguro de remover esta actividad de la membresía?')) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const datos: RemoverActividadDto = {
        idMembresia: membresiaSeleccionada.id,
        idActividad: actividadId,
      };

      await membresiasService.removerActividad(datos);
      setSuccess('Actividad removida exitosamente');

      // Recargar la membresía
      const membresiaActualizada = await membresiasService.obtenerPorId(membresiaSeleccionada.id);
      setMembresiaSeleccionada(membresiaActualizada);

      // Actualizar también la lista de membresías
      const indexMembresia = membresias.findIndex(m => m.id === membresiaSeleccionada.id);
      if (indexMembresia !== -1) {
        const nuevasMembresias = [...membresias];
        nuevasMembresias[indexMembresia] = membresiaActualizada;
        setMembresias(nuevasMembresias);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error al remover la actividad';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMesNombre = (mes: number) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/membresias"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al listado
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Asignar Actividades</h1>
          <p className="text-sm text-gray-500 mt-1">Asigna o remueve actividades de las membresías (Recepcionista)</p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Buscar Socio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Socio *
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchSocio}
                  onChange={(e) => setSearchSocio(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), buscarSocios())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Buscar por nombre, DNI o número de socio..."
                />
              </div>
              <button
                type="button"
                onClick={buscarSocios}
                disabled={isLoadingSocios}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {isLoadingSocios ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Lista de socios encontrados */}
            {socios.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {socios.map((socio) => (
                  <button
                    key={socio.id}
                    type="button"
                    onClick={() => {
                      cargarMembresias(socio.id);
                      setSocios([]);
                      setSearchSocio(`${socio.nombre} ${socio.apellido} - ${socio.numeroSocio}`);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {socio.nombre} {socio.apellido}
                    </p>
                    <p className="text-xs text-gray-500">
                      #{socio.numeroSocio} - {socio.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Membresías del socio */}
          {isLoadingMembresias ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : membresias.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar Membresía
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {membresias.map((membresia) => (
                  <button
                    key={membresia.id}
                    type="button"
                    onClick={() => setMembresiaSeleccionada(membresia)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      membresiaSeleccionada?.id === membresia.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {getMesNombre(membresia.periodoMes)} {membresia.periodoAnio}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {membresia.actividades.length} actividad(es)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Total: ${membresia.totalCargado.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Actividades de la membresía seleccionada */}
          {membresiaSeleccionada && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actividades actuales */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Actividades Asignadas</h3>
                <div className="space-y-2">
                  {membresiaSeleccionada.actividades.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay actividades asignadas</p>
                  ) : (
                    membresiaSeleccionada.actividades.map((actividad) => (
                      <div
                        key={actividad.idActividad}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{actividad.nombreActividad}</p>
                          <p className="text-xs text-gray-500">${actividad.precioAlMomento.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoverActividad(actividad.idActividad)}
                          disabled={isSubmitting}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Remover actividad"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actividades disponibles */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Actividades Disponibles</h3>
                <div className="space-y-2">
                  {actividades
                    .filter((a) => !membresiaSeleccionada.actividades.some((ma) => ma.idActividad === a.id))
                    .map((actividad) => (
                      <div
                        key={actividad.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{actividad.nombre}</p>
                          <p className="text-xs text-gray-500">${actividad.precio.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleAsignarActividad(actividad.id)}
                          disabled={isSubmitting}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Asignar actividad"
                        >
                          <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
