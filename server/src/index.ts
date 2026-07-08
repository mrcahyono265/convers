import { validateEnv, env } from './config/env';
import { checkDatabase } from './database/check';
import { createModuleLogger } from './utils/logger';

const log = createModuleLogger('server');

validateEnv();

await checkDatabase();

import app from './app'

const port = env.PORT

log.info({ port, env: env.NODE_ENV }, `Server starting on port ${port}`);

// Graceful shutdown
function shutdown(signal: string) {
  log.info({ signal }, `Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default {
  port,
  fetch: app.fetch,
}
