import apiClient from './client';

export interface Pago {
  id: number;
  idMembresia: number;
  periodoMembresia: string;
  idSocio: number;
  numeroSocio: string;
  nombreSocio: string;
  idMetodoPago: number;
  metodoPagoNombre: string;
  idUsuarioProcesa?: number;
  nombreUsuarioProcesa?: string;
  monto: number;
  fechaPago: string;
  fechaCreacion: string;
}

export interface RegistrarPagoDto {
  idMembresia: number;
  idMetodoPago: number;
  monto: number;
  fechaPago?: string;
}

export interface ComprobantePago {
  idPago: number;
  numeroComprobante: string;
  fechaEmision: string;
  numeroSocio: string;
  nombreSocio: string;
  periodoMembresia: string;
  totalMembresia: number;
  totalPagadoAntes: number;
  montoPago: number;
  nuevoSaldo: number;
  estaPaga: boolean;
  metodoPago: string;
  fechaPago: string;
  usuarioProcesa: string;
  actividades: ActividadComprobante[];
}

export interface ActividadComprobante {
  nombre: string;
  precio: number;
}

export interface FiltrosPagos {
  idMembresia?: number;
  idSocio?: number;
  idMetodoPago?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

export interface MetodoPago {
  id: number;
  nombre: string;
  estaActivo: boolean;
}

export interface EstadisticasPagos {
  totalRecaudado: number;
  totalPagosHoy: number;
  totalPagosMes: number;
  totalPendiente: number;
  pagosPorMetodo: { metodo: string; total: number; cantidad: number }[];
  pagosPorDia: { fecha: string; total: number; cantidad: number }[];
}

class PagosService {
  async listar(filtros?: FiltrosPagos): Promise<Pago[]> {
    const params = new URLSearchParams();

    if (filtros?.idMembresia) params.append('idMembresia', filtros.idMembresia.toString());
    if (filtros?.idSocio) params.append('idSocio', filtros.idSocio.toString());
    if (filtros?.idMetodoPago) params.append('idMetodoPago', filtros.idMetodoPago.toString());
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.pageSize) params.append('pageSize', filtros.pageSize.toString());

    const response = await apiClient.get(`/pagos?${params.toString()}`);
    return response.data;
  }

  async obtenerPorId(id: number): Promise<Pago> {
    const response = await apiClient.get(`/pagos/${id}`);
    return response.data;
  }

  async registrar(pago: RegistrarPagoDto): Promise<Pago> {
    const response = await apiClient.post('/pagos', pago);
    return response.data;
  }

  async obtenerComprobante(idPago: number): Promise<ComprobantePago> {
    const response = await apiClient.get(`/pagos/${idPago}/comprobante`);
    return response.data;
  }

  async obtenerMetodosPago(): Promise<MetodoPago[]> {
    const response = await apiClient.get('/pagos/metodos');
    return response.data;
  }

  async obtenerEstadisticas(fechaDesde?: string, fechaHasta?: string): Promise<EstadisticasPagos> {
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const response = await apiClient.get(`/pagos/estadisticas?${params.toString()}`);
    return response.data;
  }
}

export const pagosService = new PagosService();
