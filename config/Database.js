import { Sequelize } from "sequelize";
import "dotenv/config";

// MySQL Database Configuration
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

// PostgreSQL Database Configuration
const PG_DB_NAME = process.env.PG_DB_NAME;
const PG_DB_USERNAME = process.env.PG_DB_USERNAME;
const PG_DB_PASSWORD = process.env.PG_DB_PASSWORD;
const PG_DB_HOST = process.env.PG_DB_HOST;

// MySQL Connection (untuk operasional utama)
const db = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false, // Set true untuk debug
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// PostgreSQL Connection (untuk reporting & analytics)
const dbPg = new Sequelize(PG_DB_NAME, PG_DB_USERNAME, PG_DB_PASSWORD, {
  host: PG_DB_HOST,
  dialect: "postgres",
  logging: false, // Set true untuk debug
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test Connection Function
export const testConnections = async () => {
  try {
    await db.authenticate();
    console.log('✅ MySQL connection established successfully.');
    
    await dbPg.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

export { db as mysqlDb, dbPg as postgresDb };
export default db;