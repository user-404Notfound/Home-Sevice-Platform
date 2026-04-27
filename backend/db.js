const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'home_service_db',
  password: 'sanmesh',
  port: 5432,
});

module.exports = pool;