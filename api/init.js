// Initialize database tables
import { getDb } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = getDb();

    // Create baristas table
    await sql`
      CREATE TABLE IF NOT EXISTS baristas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create schedules table
    await sql`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        schedule_date DATE NOT NULL,
        shift_type VARCHAR(20) NOT NULL,
        barista_id INTEGER REFERENCES baristas(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(schedule_date, shift_type, barista_id)
      )
    `;

    // Create inventory_items table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        min_stock DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create stock_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
        transaction_date DATE NOT NULL,
        transaction_type VARCHAR(10) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        last_stock DECIMAL(10,2),
        current_stock DECIMAL(10,2),
        notes TEXT,
        created_by INTEGER REFERENCES baristas(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create stock_opname table
    await sql`
      CREATE TABLE IF NOT EXISTS stock_opname (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
        opname_date DATE NOT NULL,
        beginning_stock DECIMAL(10,2) NOT NULL,
        stock_in DECIMAL(10,2) DEFAULT 0,
        expected_stock DECIMAL(10,2),
        actual_stock DECIMAL(10,2) NOT NULL,
        stock_out DECIMAL(10,2),
        variance DECIMAL(10,2),
        notes TEXT,
        created_by INTEGER REFERENCES baristas(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(item_id, opname_date)
      )
    `;

    // Check if baristas table is empty, seed default data
    const existingBaristas = await sql`SELECT COUNT(*) as count FROM baristas`;
    
    if (parseInt(existingBaristas[0].count) === 0) {
      // Seed default baristas
      await sql`
        INSERT INTO baristas (name, role, avatar) VALUES
        ('Budi', 'Head Barista', 'https://ui-avatars.com/api/?name=Budi&background=d4a373&color=fff'),
        ('Siti', 'Senior Barista', 'https://ui-avatars.com/api/?name=Siti&background=faedcd&color=0f1115'),
        ('Andi', 'Barista', 'https://ui-avatars.com/api/?name=Andi&background=6b705c&color=fff'),
        ('Dewi', 'Barista', 'https://ui-avatars.com/api/?name=Dewi&background=dda15e&color=fff'),
        ('Aji', 'Head Barista', 'https://ui-avatars.com/api/?name=Aji&background=d4a373&color=fff'),
        ('Maya', 'Casual', 'https://ui-avatars.com/api/?name=Maya&background=8b5cf6&color=fff')
      `;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully',
      tables: ['baristas', 'schedules', 'inventory_items', 'stock_transactions', 'stock_opname']
    });

  } catch (error) {
    console.error('Database init error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
