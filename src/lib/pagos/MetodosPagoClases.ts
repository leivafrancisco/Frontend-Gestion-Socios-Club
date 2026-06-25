import { Pago, ComprobantePago } from '../api/pagos';

/**
 * Clase abstracta que representa la estrategia general de un Método de Pago.
 * Corresponde a la superclase <<Abstract>> MetodoPago del diagrama de clases.
 */
export abstract class MetodoPago {
  protected Id: number;
  protected Nombre: string;
  protected Monto: Pago;

  constructor(id: number, nombre: string, monto: Pago) {
    this.Id = id;
    this.Nombre = nombre;
    this.Monto = monto;
  }

  /**
   * Ejecuta el procesamiento del pago.
   * @param monto Monto a pagar
   */
  abstract procesarPago(monto: number): boolean;

  /**
   * Genera un comprobante para el pago realizado.
   */
  abstract generarComprobante(): ComprobantePago;
}

/**
 * Estrategia de Pago con Tarjeta (Débito/Crédito).
 */
export class Tarjeta extends MetodoPago {
  public Numero: string;
  public FechaVencimiento: string;
  public TitularDni: string;
  public CVV: string;

  constructor(
    id: number,
    nombre: string,
    monto: Pago,
    numero: string,
    fechaVencimiento: string,
    titularDni: string,
    cvv: string
  ) {
    super(id, nombre, monto);
    this.Numero = numero;
    this.FechaVencimiento = fechaVencimiento;
    this.TitularDni = titularDni;
    this.CVV = cvv;
  }

  /**
   * Valida si los datos de la tarjeta son correctos.
   */
  public validarTarjeta(): boolean {
    const numLimpio = this.Numero.replace(/\s/g, '');
    if (numLimpio.length < 15 || numLimpio.length > 16) return false;
    if (this.CVV.length < 3 || this.CVV.length > 4) return false;
    if (!this.FechaVencimiento.includes('/')) return false;
    return true;
  }

  /**
   * Simula la tokenización de la tarjeta con una pasarela de pagos.
   */
  public tokenizarTarjeta(): string {
    if (!this.validarTarjeta()) {
      throw new Error('Datos de tarjeta inválidos para tokenización.');
    }
    // Genera un token ficticio basado en el número de tarjeta
    const tkn = btoa(`tok_${this.Numero.slice(-4)}_${Date.now()}`);
    return tkn;
  }

  /**
   * Detecta la red de la tarjeta (Visa, Mastercard, etc.) según el primer dígito.
   */
  public detectarRed(Numero: string): 'visa' | 'mastercard' | 'desconocida' {
    const limpio = Numero.replace(/\s/g, '');
    if (limpio.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(limpio)) return 'mastercard';
    return 'desconocida';
  }

  /**
   * Implementación de procesarPago para Tarjeta.
   */
  public procesarPago(monto: number): boolean {
    console.log(`Procesando pago con Tarjeta de $${monto}...`);
    if (!this.validarTarjeta()) {
      console.error('Error: Tarjeta no válida.');
      return false;
    }
    const token = this.tokenizarTarjeta();
    console.log(`Pago aprobado por pasarela con token: ${token}`);
    return true;
  }

  /**
   * Implementación de generarComprobante para Tarjeta.
   */
  public generarComprobante(): ComprobantePago {
    return {
      idPago: this.Monto.id,
      numeroComprobante: `COMP-TC-${this.Monto.id}-${Date.now().toString().slice(-4)}`,
      fechaEmision: new Date().toISOString(),
      numeroSocio: this.Monto.numeroSocio,
      nombreSocio: this.Monto.nombreSocio,
      periodoMembresia: this.Monto.periodoMembresia,
      totalMembresia: this.Monto.monto,
      totalPagadoAntes: 0,
      montoPago: this.Monto.monto,
      nuevoSaldo: 0,
      estaPaga: true,
      metodoPago: this.Nombre,
      fechaPago: this.Monto.fechaPago,
      usuarioProcesa: this.Monto.nombreUsuarioProcesa || 'Sistema',
      actividades: [],
    };
  }
}

/**
 * Estrategia de Pago por Transferencia Bancaria.
 */
export class Transferencia extends MetodoPago {
  public CVU: string;
  public Alias: string;

  constructor(id: number, nombre: string, monto: Pago, cvu: string, alias: string) {
    super(id, nombre, monto);
    this.CVU = cvu;
    this.Alias = alias;
  }

  /**
   * Genera el enlace de datos que será convertido en código QR.
   */
  public generarCodigoQR(monto: number): string {
    const qrData = `${this.Alias}|CBU:${this.CVU}|monto:${monto}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;
  }

  /**
   * Simula la consulta del estado de la transferencia en el banco.
   */
  public consultarTransferencia(): boolean {
    console.log(`Consultando acreditación de transferencia en CVU: ${this.CVU}...`);
    // Simulamos que la transferencia está acreditada
    return true;
  }

  /**
   * Implementación de procesarPago para Transferencia.
   */
  public procesarPago(monto: number): boolean {
    console.log(`Generando datos de transferencia por $${monto}...`);
    const qr = this.generarCodigoQR(monto);
    console.log(`QR de pago listo: ${qr}`);
    return this.consultarTransferencia();
  }

  /**
   * Implementación de generarComprobante para Transferencia.
   */
  public generarComprobante(): ComprobantePago {
    return {
      idPago: this.Monto.id,
      numeroComprobante: `COMP-TR-${this.Monto.id}-${Date.now().toString().slice(-4)}`,
      fechaEmision: new Date().toISOString(),
      numeroSocio: this.Monto.numeroSocio,
      nombreSocio: this.Monto.nombreSocio,
      periodoMembresia: this.Monto.periodoMembresia,
      totalMembresia: this.Monto.monto,
      totalPagadoAntes: 0,
      montoPago: this.Monto.monto,
      nuevoSaldo: 0,
      estaPaga: true,
      metodoPago: this.Nombre,
      fechaPago: this.Monto.fechaPago,
      usuarioProcesa: this.Monto.nombreUsuarioProcesa || 'Sistema',
      actividades: [],
    };
  }
}

/**
 * Estrategia de Pago en Efectivo.
 */
export class Efectivo extends MetodoPago {
  public Descripcion: string;
  public porcenDescuento: number;

  constructor(id: number, nombre: string, monto: Pago, descripcion: string, porcenDescuento: number) {
    super(id, nombre, monto);
    this.Descripcion = descripcion;
    this.porcenDescuento = porcenDescuento;
  }

  /**
   * Calcula el vuelto necesario en base al monto entregado por el cliente.
   */
  public calcularVuelto(montoEntregado: number): number {
    const vuelto = montoEntregado - this.Monto.monto;
    if (vuelto < 0) {
      throw new Error('El monto entregado es menor que el monto a pagar.');
    }
    return vuelto;
  }

  /**
   * Calcula el descuento aplicable en base al porcentaje.
   */
  public calcularDescuento(monto: number): number {
    return (monto * this.porcenDescuento) / 100;
  }

  /**
   * Implementación de procesarPago para Efectivo.
   */
  public procesarPago(monto: number): boolean {
    console.log(`Procesando pago en efectivo por $${monto}...`);
    const descuento = this.calcularDescuento(monto);
    console.log(`Descuento aplicado (${this.porcenDescuento}%): $${descuento}`);
    console.log(`Monto final a recibir: $${monto - descuento}`);
    console.log(`Detalle: ${this.Descripcion}`);
    return true;
  }

  /**
   * Implementación de generarComprobante para Efectivo.
   */
  public generarComprobante(): ComprobantePago {
    const descuento = this.calcularDescuento(this.Monto.monto);
    return {
      idPago: this.Monto.id,
      numeroComprobante: `COMP-EF-${this.Monto.id}-${Date.now().toString().slice(-4)}`,
      fechaEmision: new Date().toISOString(),
      numeroSocio: this.Monto.numeroSocio,
      nombreSocio: this.Monto.nombreSocio,
      periodoMembresia: this.Monto.periodoMembresia,
      totalMembresia: this.Monto.monto,
      totalPagadoAntes: 0,
      montoPago: this.Monto.monto - descuento,
      nuevoSaldo: 0,
      estaPaga: true,
      metodoPago: this.Nombre,
      fechaPago: this.Monto.fechaPago,
      usuarioProcesa: this.Monto.nombreUsuarioProcesa || 'Sistema',
      actividades: [],
    };
  }
}
