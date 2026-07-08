import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';

export async function runMigrations(): Promise<void> {
  console.log('[DB] Running migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[DB] Migrations complete.');
  } catch (err) {
    console.error('[DB] Migration failed:', err);
    throw err;
  }
}
