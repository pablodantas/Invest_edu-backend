import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_EXPIRES_IN_DAYS: z.coerce.number().default(30),
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_MB: z.coerce.number().default(20),
})

const _env = envSchema.safeParse(process.env)
if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas', _env.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = _env.data
