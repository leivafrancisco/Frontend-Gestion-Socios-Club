'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { sociosService } from '@/lib/api/socios';
import { pagosService, type EstadisticasPagos } from '@/lib/api/pagos';
import { cuotasService, type ResumenCuotasDto } from '@/lib/api/cuotas';
import { membresiasService } from '@/lib/api/membresias';

// ── Color palette ──────────────────────────────────────────────────
const GOLD = '#C9A84C';
const TEAL = '#2DD4BF';
const CORAL = '#F87171';
const PURPLE = '#818CF8';
const ORANGE = '#F97316';
const NAVY_CARD = '#0D1E35';
const NAVY_BORDER = 'rgba(255,255,255,0.06)';

const PIE_COLORS = [TEAL, CORAL, GOLD, PURPLE];
const METHOD_COLORS: Record<string, string> = {
  Efectivo: TEAL,
  Tarjeta: PURPLE,
  Transferencia: GOLD,
};

// ── Custom Tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0A1628',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      {label && (
        <p style={{ color: '#7A96B8', fontSize: 12, marginBottom: 6 }}>{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || GOLD, fontSize: 13, fontWeight: 600 }}>
          {entry.name}:{' '}
          {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('$')
            ? `$${entry.value.toLocaleString('es-AR')}`
            : entry.value?.toLocaleString('es-AR')}
        </p>
      ))}
    </div>
  );
};

const MoneyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0A1628',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      {label && <p style={{ color: '#7A96B8', fontSize: 12, marginBottom: 6 }}>{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || GOLD, fontSize: 13, fontWeight: 600 }}>
          {entry.name}: ${Number(entry.value).toLocaleString('es-AR')}
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase mb-2" style={{ color: '#4A6A8A', letterSpacing: '0.1em' }}>
            {label}
          </p>
          <p className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, color: accent, lineHeight: 1 }}>
            {value}
          </p>
          {sub && <p className="text-xs mt-1" style={{ color: '#4A6A8A' }}>{sub}</p>}
        </div>
        <div className="p-2.5 rounded-lg" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Chart Card ────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
    >
      <h2
        className="font-display mb-5"
        style={{ fontSize: '1.1rem', fontWeight: 500, color: '#EDE8DC' }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function EstadisticasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data state
  const [socios, setSocios] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [estadPagos, setEstadPagos] = useState<EstadisticasPagos | null>(null);
  const [resumenCuotas, setResumenCuotas] = useState<ResumenCuotasDto | null>(null);
  const [totalMembresias, setTotalMembresias] = useState(0);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [listaSocios, ePagos, rCuotas, tMembresias] = await Promise.allSettled([
        sociosService.obtenerTodos({ pageSize: 500 }),
        pagosService.obtenerEstadisticas(),
        cuotasService.obtenerResumen(),
        membresiasService.obtenerTotal ? membresiasService.obtenerTotal() : Promise.resolve(0),
      ]);

      if (listaSocios.status === 'fulfilled') {
        const data = listaSocios.value;
        setSocios({
          total: data.length,
          activos: data.filter((s) => s.estaActivo).length,
          inactivos: data.filter((s) => !s.estaActivo).length,
        });
      }

      if (ePagos.status === 'fulfilled') {
        setEstadPagos(ePagos.value);
      }

      if (rCuotas.status === 'fulfilled') {
        setResumenCuotas(rCuotas.value);
      }

      if (tMembresias.status === 'fulfilled') {
        setTotalMembresias(tMembresias.value as number);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Derived data for charts ──────────────────────────────────────
  const sociosPieData = [
    { name: 'Activos', value: socios.activos },
    { name: 'Inactivos', value: socios.inactivos },
  ];

  const cuotasPieData = resumenCuotas
    ? [
        { name: 'Pagadas', value: resumenCuotas.cuotasPagadas },
        { name: 'Pendientes', value: resumenCuotas.cuotasPendientes },
        { name: 'Vencidas', value: resumenCuotas.cuotasVencidas },
      ]
    : [];

  const metodosData =
    estadPagos?.pagosPorMetodo?.map((m) => ({
      metodo: m.metodo,
      total: m.total,
      cantidad: m.cantidad,
      fill: METHOD_COLORS[m.metodo] ?? PURPLE,
    })) ?? [];

  const tendenciaData =
    estadPagos?.pagosPorDia
      ?.slice(-14)
      .map((d) => ({
        fecha: new Date(d.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        'Total $': d.total,
        Pagos: d.cantidad,
      })) ?? [];

  // ── Render ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div
          className="w-12 h-12 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(201,168,76,0.15)', borderTopColor: GOLD }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-display mb-1"
            style={{ fontSize: '2rem', fontWeight: 600, color: '#EDE8DC', letterSpacing: '0.02em' }}
          >
            Estadísticas
          </h1>
          <p className="text-sm" style={{ color: '#4A6A8A' }}>
            Panel de métricas y gráficos en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs" style={{ color: '#4A6A8A' }}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}
          </p>
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}30` }}
            onMouseOver={(e) => (e.currentTarget.style.background = `${GOLD}28`)}
            onMouseOut={(e) => (e.currentTarget.style.background = `${GOLD}18`)}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Stats KPI Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Socios"
          value={socios.total}
          sub={`${socios.activos} activos`}
          icon={<Users className="w-5 h-5" />}
          accent={GOLD}
        />
        <StatCard
          label="Recaudado Hoy"
          value={`$${(estadPagos?.totalPagosHoy ?? 0).toLocaleString('es-AR')}`}
          sub="este día"
          icon={<DollarSign className="w-5 h-5" />}
          accent={TEAL}
        />
        <StatCard
          label="Recaudado Este Mes"
          value={`$${(estadPagos?.totalPagosMes ?? 0).toLocaleString('es-AR')}`}
          sub="mes en curso"
          icon={<TrendingUp className="w-5 h-5" />}
          accent={PURPLE}
        />
        <StatCard
          label="Deuda Pendiente"
          value={`$${(estadPagos?.totalPendiente ?? 0).toLocaleString('es-AR')}`}
          sub={`${resumenCuotas?.totalMorosos ?? 0} morosos`}
          icon={<AlertTriangle className="w-5 h-5" />}
          accent={CORAL}
        />
      </div>

      {/* ── Second Row Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Cuotas Pagadas"
          value={resumenCuotas?.cuotasPagadas ?? 0}
          icon={<CheckCircle className="w-5 h-5" />}
          accent={TEAL}
        />
        <StatCard
          label="Cuotas Pendientes"
          value={resumenCuotas?.cuotasPendientes ?? 0}
          icon={<Clock className="w-5 h-5" />}
          accent={GOLD}
        />
        <StatCard
          label="Cuotas Vencidas"
          value={resumenCuotas?.cuotasVencidas ?? 0}
          icon={<XCircle className="w-5 h-5" />}
          accent={CORAL}
        />
        <StatCard
          label="Total Membresías"
          value={totalMembresias}
          icon={<CreditCard className="w-5 h-5" />}
          accent={ORANGE}
        />
      </div>

      {/* ── Charts Row 1: Tendencia + Socios Pie ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Tendencia de recaudación */}
        <div className="lg:col-span-2">
          <ChartCard title="Tendencia de Recaudación — Últimos 14 días">
            {tendenciaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={tendenciaData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fill: '#4A6A8A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4A6A8A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<MoneyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#7A96B8', paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total $"
                    stroke={GOLD}
                    strokeWidth={2}
                    fill="url(#gradGold)"
                    dot={false}
                    activeDot={{ r: 5, fill: GOLD }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Sin datos de tendencia disponibles" />
            )}
          </ChartCard>
        </div>

        {/* Pie socios */}
        <ChartCard title="Estado de Socios">
          {socios.total > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={sociosPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sociosPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#7A96B8', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sin datos de socios" />
          )}
          {/* Centered label */}
          <div className="text-center mt-1">
            <p style={{ color: '#4A6A8A', fontSize: 12 }}>Total: {socios.total}</p>
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Métodos + Cuotas pie + Deuda ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Métodos de pago */}
        <ChartCard title="Recaudación por Método de Pago">
          {metodosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metodosData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="metodo"
                  tick={{ fill: '#4A6A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#4A6A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Bar dataKey="total" name="Total $" radius={[6, 6, 0, 0]}>
                  {metodosData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sin datos de métodos de pago" />
          )}
        </ChartCard>

        {/* Cuotas pie */}
        <ChartCard title="Estado de Cuotas">
          {cuotasPieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={cuotasPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cuotasPieData.map((_, i) => (
                    <Cell key={i} fill={[TEAL, GOLD, CORAL][i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#7A96B8', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sin datos de cuotas" />
          )}
        </ChartCard>

        {/* Deuda montos */}
        <ChartCard title="Resumen Financiero">
          <div className="space-y-4 mt-2">
            {[
              {
                label: 'Total Recaudado',
                value: estadPagos?.totalRecaudado ?? 0,
                color: TEAL,
                pct: 100,
              },
              {
                label: 'Monto Pendiente',
                value: resumenCuotas?.montoTotalPendiente ?? 0,
                color: GOLD,
                pct: estadPagos?.totalRecaudado
                  ? Math.min(
                      100,
                      ((resumenCuotas?.montoTotalPendiente ?? 0) / estadPagos.totalRecaudado) * 100
                    )
                  : 0,
              },
              {
                label: 'Monto Vencido',
                value: resumenCuotas?.montoTotalVencido ?? 0,
                color: CORAL,
                pct: estadPagos?.totalRecaudado
                  ? Math.min(
                      100,
                      ((resumenCuotas?.montoTotalVencido ?? 0) / estadPagos.totalRecaudado) * 100
                    )
                  : 0,
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ color: '#7A96B8', fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: 13, fontWeight: 600 }}>
                    ${item.value.toLocaleString('es-AR')}
                  </span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.pct}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: '#4A6A8A', fontSize: 12 }}>Socios Morosos</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: `${CORAL}18`, color: CORAL }}
                >
                  {resumenCuotas?.totalMorosos ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span style={{ color: '#4A6A8A', fontSize: 12 }}>Total Cuotas</span>
                <span style={{ color: '#7A96B8', fontSize: 12 }}>
                  {resumenCuotas?.totalCuotas ?? 0}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Cantidad de pagos por día ────────────────────────── */}
      {tendenciaData.length > 0 && (
        <div className="mb-6">
          <ChartCard title="Cantidad de Pagos por Día — Últimos 14 días">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tendenciaData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: '#4A6A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#4A6A8A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Pagos" fill={PURPLE} radius={[5, 5, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-lg"
        style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}
      >
        <BarChart2 className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
        <p className="text-xs" style={{ color: '#4A6A8A' }}>
          Los datos se obtienen en tiempo real desde la API. Usá el botón{' '}
          <span style={{ color: GOLD }}>Actualizar</span> para refrescar las métricas.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 240, color: '#3A5A7A', fontSize: 13 }}
    >
      {message}
    </div>
  );
}
