import { validateEnv } from './config/env';
import { runMigrations } from './database/migrate';

validateEnv();

await runMigrations();

import app from './app'

const port = parseInt(process.env.PORT || '3000', 10)

console.log(`Server is running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
