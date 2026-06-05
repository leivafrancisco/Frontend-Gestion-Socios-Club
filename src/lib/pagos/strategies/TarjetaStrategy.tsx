'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import type { PagoStrategy } from '../PagoStrategy';

const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const ANIOS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i).slice(-2));

function detectarRed(numero: string): 'visa' | 'mastercard' | null {
  if (numero.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(numero)) return 'mastercard';
  return null;
}

function formatearNumero(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function FormTarjeta({ monto }: { monto: number }) {
  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [cvv, setCvv] = useState('');
  const [dni, setDni] = useState('');

  const red = detectarRed(numero.replace(/\s/g, ''));

  return (
    <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <p className="font-semibold text-blue-800">Datos de la tarjeta</p>
      </div>

      {/* Número */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(formatearNumero(e.target.value))}
            placeholder="0000 0000 0000 0000"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            {(red === 'visa' || !red) && (
              <span className="text-[10px] font-extrabold italic text-blue-700 bg-white border border-gray-200 px-1.5 py-0.5 rounded">VISA</span>
            )}
            {(red === 'mastercard' || !red) && (
              <span className="flex items-center gap-0.5 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                <span className="w-3 h-3 rounded-full bg-red-500 opacity-90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-90 inline-block -ml-1.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monto total */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold text-gray-700">
          $ {monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre y Apellido como figura en la tarjeta</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value.toUpperCase())}
          placeholder="JUAN PEREZ"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Vencimiento + CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Vencimiento</label>
          <div className="flex items-center gap-1">
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="flex-1 px-2 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">MM</option>
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-gray-400 font-bold">/</span>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="flex-1 px-2 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">AA</option>
              {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <Lock className="w-3 h-3 inline mr-1" />
            Código de Seguridad
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* DNI */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">DNI del pagador (Opcional)</label>
        <input
          type="text"
          inputMode="numeric"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="12345678"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
}

export const tarjetaStrategy: PagoStrategy = {
  renderUI: (monto: number) => <FormTarjeta monto={monto} />,
};
