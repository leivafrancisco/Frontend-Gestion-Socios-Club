import { Banknote } from 'lucide-react';
import type { PagoStrategy } from '../PagoStrategy';

export const efectivoStrategy: PagoStrategy = {
  renderUI: (monto: number) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <Banknote className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-gray-800">Pago en efectivo</p>
        <p className="text-sm text-gray-600 mt-1">
          Asegurate de recibir{' '}
          <strong className="text-gray-900">
            ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </strong>{' '}
          en mano del socio antes de confirmar.
        </p>
      </div>
    </div>
  ),
};
