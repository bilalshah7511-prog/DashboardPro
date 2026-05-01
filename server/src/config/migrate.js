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

    // Create blogs table (updated with view_count)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        featured_image TEXT,
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'unpublished')),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      )
    `)
    console.log('✅ Blogs table created')

    // Add view_count column if it doesn't exist (for existing tables)
    try {
      await pool.query(`
        ALTER TABLE blogs 
        ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0
      `)
      console.log('✅ view_count column added to blogs')
    } catch (err) {
      console.log('ℹ️ view_count column may already exist')
    }

    // Create blog_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )
    `)
    console.log('✅ Blog likes table created')

    // Create blog_comments table (with parent_id for nested replies)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Blog comments table created')

    // Add parent_id column if it doesn't exist (for existing tables)
    try {
      await pool.query(`
        ALTER TABLE blog_comments 
        ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE
      `)
      console.log('✅ parent_id column added to blog_comments')
    } catch (err) {
      console.log('ℹ️ parent_id column may already exist')
    }

    // Create blog_views table (for unique view tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_views (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id, ip_address)
      )
    `)
    console.log('✅ Blog views table created')

    // Add indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
      CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON blogs(user_id);
      CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON blog_likes(blog_id);
      CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
      CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id ON blog_views(blog_id);
    `)
    console.log('✅ Blog indexes created')

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'reply', 'blog_approved'
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        sender_name VARCHAR(255),
        sender_image TEXT,
        blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Notifications table created')

    // Add sender columns if not exist (for existing tables)
    try {
      await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255)`)
      await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_image TEXT`)
      console.log('✅ Sender columns added to notifications')
    } catch (err) {
      console.log('ℹ️ Sender columns may already exist')
    }

    // Create friends table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `)
    console.log('✅ Friends table created')

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        image_url TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Messages table created')

    // Create blocks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id SERIAL PRIMARY KEY,
        blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blocker_id, blocked_id)
      )
    `)
    console.log('✅ Blocks table created')

    // Create following table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS following (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `)
    console.log('✅ Following table created')

    // Add indexes for chat tables
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
      CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
      CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
      CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);
      CREATE INDEX IF NOT EXISTS idx_following_follower_id ON following(follower_id);
      CREATE INDEX IF NOT EXISTS idx_following_following_id ON following(following_id);
    `)
    console.log('✅ Chat indexes created')

    // Add message tracking columns if not exist
    try {
      await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`)
      await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP`)
      await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP`)
      await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`)
      console.log('✅ Message tracking columns added')
    } catch (err) {
      console.log('ℹ️ Message tracking columns may already exist')
    }

    console.log('🎉 Database migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

createTables()
