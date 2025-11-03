import { ZodError } from 'zod';

export function mapZod(error: ZodError) {
  return {
    message: 'Erro de validação',
    issues: error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    })),
  };
}
