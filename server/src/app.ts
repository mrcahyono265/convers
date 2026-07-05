import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { readFileSync } from 'fs'
import { join } from 'path'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: '*', // We can restrict this later
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err)
  return c.json({ success: false, message: 'Internal Server Error' }, 500)
})

import conversationRouter from './modules/conversation/router'
import vocabularyRouter from './modules/vocabulary/router'
import journalRouter from './modules/journal/router'
import dashboardRouter from './modules/dashboard/router'
import { authMiddleware } from './middleware/auth'

// Apply auth middleware to all API routes
app.use('/api/*', authMiddleware)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

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
