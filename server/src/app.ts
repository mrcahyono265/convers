import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { readFileSync } from 'fs'
import { join } from 'path'
import { env } from './config/env'
import { handleError } from './utils/response'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.onError((err, c) => {
  return handleError(c, err)
})

import authRouter from './modules/auth/router'
import conversationRouter from './modules/conversation/router'
import vocabularyRouter from './modules/vocabulary/router'
import journalRouter from './modules/journal/router'
import dashboardRouter from './modules/dashboard/router'
import { jwtMiddleware } from './middleware/jwt'

// Public routes (no auth required)
app.route('/api/auth', authRouter)

// Health check (public)
app.get('/health', (c) => {
  return c.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

// Protected API routes
app.use('/api/*', jwtMiddleware)
app.route('/api/chat', conversationRouter)
app.route('/api/vocabulary', vocabularyRouter)
app.route('/api/journal', journalRouter)
app.route('/api/dashboard', dashboardRouter)

// Serve Static Frontend
app.use('/*', serveStatic({ root: '../client/dist' }))

// Fallback for React Router (SPA)
app.get('*', (c) => {
  try {
    const html = readFileSync(join(process.cwd(), '../client/dist/index.html'), 'utf-8')
    return c.html(html)
  } catch (e) {
    return c.text('Frontend build not found. Run `npm run build` in client.', 404)
  }
})

export default app
