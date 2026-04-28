import pool from './database.js'

const createBlogTables = async () => {
  try {
    console.log('🔄 Creating blog tables...')

    // Create blogs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        featured_image TEXT,
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      )
    `)

    console.log('✅ Blog tables created successfully!')
  } catch (error) {
    console.error('❌ Blog migration failed:', error)
    throw error
  }
}

createBlogTables()
  .then(() => {
    console.log('✅ Blog migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Blog migration failed:', error)
    process.exit(1)
  })
