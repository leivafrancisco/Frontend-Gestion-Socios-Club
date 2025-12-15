/**
 * Utilidades de validación para formularios
 */

/**
 * Verifica si un string no está vacío y no contiene solo espacios en blanco
 * @param value - El valor a validar
 * @returns true si el valor es válido (no vacío y no solo espacios)
 */
export const isNotEmpty = (value: string | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  return value.trim().length > 0;
};

/**
 * Valida que un string no esté vacío ni contenga solo espacios
 * @param value - El valor a validar
 * @param fieldName - Nombre del campo (para el mensaje de error)
 * @returns null si es válido, string con mensaje de error si no es válido
 */
export const validateRequired = (
  value: string | undefined | null,
  fieldName: string = 'Este campo'
): string | null => {
  if (!isNotEmpty(value)) {
    return `${fieldName} es requerido y no puede estar vacío`;
  }
  return null;
};

/**
 * Limpia espacios en blanco al inicio y final de un string
 * Útil para aplicar en onChange de inputs
 * @param value - El valor a limpiar
 * @returns El valor sin espacios al inicio/final, o string vacío si es null/undefined
 */
export const trimValue = (value: string | undefined | null): string => {
  if (value === undefined || value === null) return '';
  return value.trim();
};

/**
 * Valida múltiples campos requeridos de un objeto
 * @param data - Objeto con los datos a validar
 * @param fields - Array de objetos con nombre del campo y label para el mensaje
 * @returns Objeto con errores por campo (vacío si no hay errores)
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  data: T,
  fields: Array<{ name: keyof T; label: string }>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  fields.forEach(({ name, label }) => {
    const value = data[name];
    if (typeof value === 'string') {
      const error = validateRequired(value, label);
      if (error) {
        errors[name] = error;
      }
    } else if (value === undefined || value === null || value === '') {
      errors[name] = `${label} es requerido`;
    }
  });

  return errors;
};

/**
 * Hook de validación para usar en inputs
 * Previene espacios solo en blanco
 */
export const createInputValidator = () => {
  return {
    /**
     * Valida un input en tiempo real
     * @param value - Valor actual del input
     * @param previousValue - Valor anterior (opcional)
     * @returns El valor validado
     */
    validate: (value: string, previousValue?: string): string => {
      // Si el valor es solo espacios, devolver el valor anterior o vacío
      if (value.length > 0 && value.trim().length === 0) {
        return previousValue || '';
      }
      return value;
    },

    /**
     * Valida un valor en onBlur (al perder el foco)
     * @param value - Valor del input
     * @returns El valor con trim aplicado
     */
    onBlur: (value: string): string => {
      return value.trim();
    },
  };
};

/**
 * Valida email
 * @param email - Email a validar
 * @returns true si es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un string tenga una longitud mínima (sin contar espacios en blanco)
 * @param value - Valor a validar
 * @param minLength - Longitud mínima requerida
 * @returns true si cumple con la longitud mínima
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Valida que un string tenga una longitud máxima
 * @param value - Valor a validar
 * @param maxLength - Longitud máxima permitida
 * @returns true si cumple con la longitud máxima
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};
