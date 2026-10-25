import { Pool } from 'pg';
import { config } from '../config';

const isLocalhost = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: process.env.NODE_ENV === 'production' ? 10 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
