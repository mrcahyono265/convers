import { sql } from 'drizzle-orm';
import { db } from './index';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('database');

export async function checkDatabase(): Promise<void> {
  log.info('Checking database connection...');
  try {
    await db.execute(sql`SELECT 1`);
    log.info('Database connection established.');
  } catch (err) {
    log.error({ err }, 'Database connection failed');
    throw err;
  }
}
