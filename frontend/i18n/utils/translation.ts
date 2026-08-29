import { Language } from '../config';

/**
 * Safely resolves a dot-notation key path on a nested dictionary object.
 */
export function resolveKeyPath(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  if (typeof current === 'string') {
    return current;
  }

  return undefined;
}

/**
 * Format string with interpolations e.g. "Hello, {name}" -> "Hello, John"
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}
