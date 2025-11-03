import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { env } from './env/index.js'
import { appRoutes } from './http/routes.js'
import { ZodError } from 'zod'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(fastifyCors, { origin: 'http://localhost:5173', credentials: true })
  app.register(helmet, { crossOriginResourcePolicy: { policy: 'cross-origin' } }) // para abrir image externa

  app.register(fastifyCookie)
  app.register(fastifyMultipart, {
    limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 }
  })

  app.register(fastifyStatic, {
    root: path.resolve(env.UPLOAD_DIR),
    prefix: '/uploads/'
  })

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
    cookie: { cookieName: 'refreshToken', signed: false }
  })

  app.register(appRoutes)

  
  app.setErrorHandler(async (error, req, reply) => {
    const { AppError } = await import('./errors/AppError.js');
    const { ZodError } = await import('zod');
    if (error instanceof ZodError) {
      const mapper = await import('./http/errors/zod-error-mapper.js');
      return reply.status(400).send(mapper.mapZod(error));
    }
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
        details: error.details ?? null,
      });
    }
    req.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  })


  return app
}
