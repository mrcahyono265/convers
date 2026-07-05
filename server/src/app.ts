import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

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
export default app
