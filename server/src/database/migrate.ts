import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('database');

export async function runMigrations(): Promise<void> {
  log.info('Running migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    log.info('Migrations complete.');
  } catch (err) {
    log.error({ err }, 'Migration failed');
    throw err;
  }
}

async function main() {
  await runMigrations();
  process.exit(0);
}

if (import.meta.main) {
  main().catch((err) => {
    log.fatal({ err }, 'Migration failed');
    process.exit(1);
  });
}
