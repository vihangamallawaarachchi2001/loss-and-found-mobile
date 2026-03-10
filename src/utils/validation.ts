import { CreateReportInput } from '../domain/types';

export type ValidationErrors = Partial<Record<keyof CreateReportInput, string>>;

const isValidPhone = (phone: string): boolean => {
  const normalized = phone.replace(/[\s-]/g, '');
  return /^(\+94|0)?7\d{8}$/.test(normalized);
};

export const validateReportInput = (payload: CreateReportInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!payload.title.trim() || payload.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!payload.description.trim() || payload.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  if (!payload.location.trim()) {
    errors.location = 'Location is required.';
  }

  if (!payload.eventAt.trim()) {
    errors.eventAt = 'Date and time are required.';
  }

  return errors;
};

export const validateProfile = (fullName: string, phone: string) => {
  const fullNameError = fullName.trim().length < 3 ? 'Name must be at least 3 characters.' : '';
  const phoneError = phone.trim() && !isValidPhone(phone) ? 'Enter a valid Sri Lankan mobile number.' : '';

  return { fullNameError, phoneError };
};
