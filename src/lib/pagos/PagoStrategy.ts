import type { ReactNode } from 'react';

export interface PagoStrategy {
  renderUI(monto: number): ReactNode;
}
