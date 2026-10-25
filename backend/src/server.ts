import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';

const app = createApp();

async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    const dbTest = await client.query('SELECT NOW()');
    client.release();
    console.log(`[FreshSupply DB] Connected to PostgreSQL at ${dbTest.rows[0].now}`);

    const server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`   FreshSupply B2B Wholesale Ordering Backend API     `);
      console.log(`   Running on: http://localhost:${config.port}                `);
      console.log(`   Health Check: http://localhost:${config.port}/health       `);
      console.log(`   Environment: ${config.nodeEnv}                        `);
      console.log(`=======================================================`);
    });

    const shutdown = async () => {
      console.log('Shutting down FreshSupply server gracefully...');
      server.close(async () => {
        await pool.end();
        console.log('PostgreSQL pool closed. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start FreshSupply backend:', err);
    process.exit(1);
  }
}

startServer();
