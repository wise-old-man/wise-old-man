import { BadRequestError } from '../errors';

interface ParameterOptions {
  key: string;
  required?: boolean;
}

function extractString(source: any, options: ParameterOptions): string | undefined {
  if (!source || !options || !options.key || (!source[options.key] && options.required)) {
    throw new BadRequestError(`Parameter '${options.key}' is undefined.`);
  }

  return String(source[options.key]);
}

function extractNumber(source: any, options: ParameterOptions): number | undefined {
  if (!source || !options || !options.key || (!source[options.key] && options.required)) {
    throw new BadRequestError(`Parameter '${options.key}' is undefined.`);
  }

  if (source[options.key] && isNaN(source[options.key])) {
    throw new BadRequestError(`Parameter '${options.key}' is not a valid number.`);
  }

  return Number(source[options.key]);
}

function extractBoolean(source: any, options: ParameterOptions): boolean | undefined {
  if (!source || !options || !options.key || (!source[options.key] && options.required)) {
    throw new BadRequestError(`Parameter "${options.key}" is undefined.`);
  }

  return source[options.key]?.toLowerCase() === 'true';
}

export { extractString, extractNumber, extractBoolean };
