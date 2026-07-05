import app from './app'

const port = parseInt(process.env.PORT || '3000')

console.log(`Server is running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
