import { BadRequestError } from '../errors';
import { isValidDate } from './dates';

interface ParameterOptions {
  key: string;
  required?: boolean;
}

function extractString(source: any, options: ParameterOptions): string | undefined {
  if (!source || !options || !options.key || (!source[options.key] && options.required)) {
    throw new BadRequestError(`Parameter '${options.key}' is undefined.`);
  }

  return options.key in source ? String(source[options.key]) : undefined;
}

function extractDate(source: any, options: ParameterOptions): Date | undefined {
  const dateString = extractString(source, options);

  if (options.required && !isValidDate(dateString)) {
    throw new BadRequestError(`Parameter '${options.key}' is not a valid date.`);
  }

  return options.key in source ? new Date(dateString) : undefined;
}

function extractNumber(source: any, options: ParameterOptions): number | undefined {
  if (!source || !options || !options.key || (!source[options.key] && options.required)) {
    throw new BadRequestError(`Parameter '${options.key}' is undefined.`);
  }

  if (source[options.key] && isNaN(source[options.key])) {
    throw new BadRequestError(`Parameter '${options.key}' is not a valid number.`);
  }

  return source[options.key] ? Number(source[options.key]) : undefined;
}

export { extractString, extractNumber, extractDate };
