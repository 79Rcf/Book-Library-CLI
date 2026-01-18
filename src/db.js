const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://ulrichkillian@localhost:3000/postgres'});

const initDB = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT,
      status TEXT CHECK (status IN ('read', 'to-read', 'reading')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(queryText);
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB,
  end: () => pool.end(),
};