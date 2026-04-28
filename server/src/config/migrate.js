import pool from './database.js'

const createTables = async () => {
  try {
    console.log('🔄 Starting database migration...')

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        gender VARCHAR(50) DEFAULT 'Not specified',
        profile_image TEXT,
        two_factor_secret VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Users table created')

    // Login records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(50),
        user_agent TEXT,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Login records table created')

    // Sessions table (for JWT refresh tokens)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Sessions table created')

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_login_records_user_id ON login_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `)
    console.log('✅ Indexes created')

    // Insert default admin user
    const adminExists = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@gmail.com'"
    )

    if (adminExists.rows.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.default.hash('admin', 10)

      await pool.query(`
        INSERT INTO users (name, email, password, role, email_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin User', 'admin@gmail.com', hashedPassword, 'admin', true])

      console.log('✅ Default admin user created')
    }

    console.log('🎉 Database migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

createTables()
