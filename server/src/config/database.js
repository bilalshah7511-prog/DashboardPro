import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Support both DATABASE_URL (Railway/Neon) and individual env variables
// Neon requires SSL always, and we need better connection management
const isNeon = process.env.DATABASE_URL?.includes('neon.tech')

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isNeon ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
      max: 10,                      // Reduce max connections for Neon free tier
      idleTimeoutMillis: 60000,      // Increase idle timeout to 60s
      connectionTimeoutMillis: 10000, // Increase connection timeout to 10s
      allowExitOnIdle: false,        // Don't exit on idle
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: false,
    })

pool.on('connect', () => {
  console.log('✅ Database connected successfully')
})

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message)
  // Don't exit - let the pool handle reconnection
  // process.exit(-1) - Removed to allow reconnection
})

// Handle connection errors gracefully
pool.on('remove', (client) => {
  console.log('🔄 Database client removed from pool')
})

export default pool
