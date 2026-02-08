import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'synthex.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.exec('PRAGMA journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
