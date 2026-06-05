import { Smartphone } from 'lucide-react';
import type { PagoStrategy } from '../PagoStrategy';

const ALIAS_CBU = 'CLUB.DEPORTIVO.ALIAS';
const CBU = '0000003100012345678901';

export const transferenciaStrategy: PagoStrategy = {
  renderUI: (monto: number) => {
    const qrData = `${ALIAS_CBU}|CBU:${CBU}|monto:${monto}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-purple-600" />
          <p className="font-medium text-purple-800">Transferencia bancaria</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={qrUrl}
            alt="QR de transferencia"
            className="w-44 h-44 border border-purple-200 rounded-lg bg-white p-1"
          />
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-purple-600 uppercase font-semibold">Alias</p>
              <p className="font-mono font-bold text-purple-900">{ALIAS_CBU}</p>
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase font-semibold">CBU</p>
              <p className="font-mono text-purple-900">{CBU}</p>
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase font-semibold">Monto</p>
              <p className="font-bold text-purple-900 text-base">
                ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              El socio debe escanear el QR o transferir al alias antes de confirmar.
            </p>
          </div>
        </div>
      </div>
    );
  },
};
