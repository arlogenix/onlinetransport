import { Pool } from 'pg';
import env from "..//../util/validateEnv";

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: 3001||process.env.PORT,
});

export default pool;
