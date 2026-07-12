export const trimValue = (value?: string | null) => String(value ?? '').trim();

export const ALGERIAN_MOBILE_NUMBER_REGEX =
  /^(?:0[5-7]\d{8}|(?:\+213|00213)[5-7]\d{8})$/;

export const isNonEmpty = (value?: string | null) => trimValue(value).length > 0;

export const hasMinLength = (value: string, min: number) =>
  trimValue(value).length >= min;

export const hasMaxLength = (value: string, max: number) =>
  trimValue(value).length <= max;

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimValue(value).toLowerCase());

export const digitsOnly = (value: string) => String(value ?? '').replace(/\D+/g, '');

export const normalizeEmail = (value: string) => trimValue(value).toLowerCase();

export const sanitizeNumericInput = (value: string, maxLength?: number) => {
  const digits = digitsOnly(value);
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
};

export const normalizeAlgerianPhoneNumber = (value: string) => {
  const input = trimValue(value);
  const digits = digitsOnly(input);

  if (!digits) {
    return '';
  }

  if (input.startsWith('+213') && digits.startsWith('213') && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('213') && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('00213') && digits.length === 14) {
    return `0${digits.slice(5)}`;
  }

  return digits;
};

export const sanitizeAlgerianPhoneInput = (value: string) =>
  trimValue(value).startsWith('+')
    ? `+${digitsOnly(value).slice(0, 12)}`
    : digitsOnly(value).slice(0, 14);

export const isAlgerianMobileNumber = (value: string) => {
  const input = trimValue(value);
  return ALGERIAN_MOBILE_NUMBER_REGEX.test(input);
};

export const isPhoneNumber = (value: string) => isAlgerianMobileNumber(value);

export const isStrongPassword = (value: string) => {
  const input = String(value ?? '');
  return (
    input.length >= 8 &&
    /[A-Z]/.test(input) &&
    /[a-z]/.test(input) &&
    /\d/.test(input) &&
    /[^A-Za-z0-9]/.test(input)
  );
};

export const isLikelyGuid = (value: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    trimValue(value),
  );
