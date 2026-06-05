import type { PagoStrategy } from './PagoStrategy';
import { efectivoStrategy } from './strategies/EfectivoStrategy';
import { tarjetaStrategy } from './strategies/TarjetaStrategy';
import { transferenciaStrategy } from './strategies/TransferenciaStrategy';

export function getPagoStrategy(nombreMetodo: string): PagoStrategy {
  const nombre = nombreMetodo.toLowerCase();

  if (nombre.includes('transferencia')) return transferenciaStrategy;
  if (nombre.includes('tarjeta') || nombre.includes('débito') || nombre.includes('debito') || nombre.includes('crédito') || nombre.includes('credito')) return tarjetaStrategy;

  return efectivoStrategy;
}
