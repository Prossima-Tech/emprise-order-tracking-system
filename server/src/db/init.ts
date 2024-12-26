// server/src/db/init.ts
import pool from '../config/database';

async function initDatabase() {
  try {
    // Example table creation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Don't end the pool here as it's needed for the application
  }
}

// Run initialization
initDatabase();

export default initDatabase;