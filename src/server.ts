import { buildApp } from './app.js'
import { env } from './env/index.js'

const app = await buildApp()
app.listen({ host: '0.0.0.0', port: env.PORT }).then(() => {
  app.log.info(`🚀 HTTP server running on http://localhost:${env.PORT}`)
})
