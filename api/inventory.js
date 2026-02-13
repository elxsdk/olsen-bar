// Inventory Items API
import { getDb } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();

  try {
    // GET - Fetch all inventory items or filter by category
    if (req.method === 'GET') {
      const { category } = req.query;
      
      let items;
      if (category && category !== 'all') {
        items = await sql`
          SELECT * FROM inventory_items 
          WHERE category = ${category}
          ORDER BY category, name
        `;
      } else {
        items = await sql`
          SELECT * FROM inventory_items 
          ORDER BY category, name
        `;
      }
      
      return res.status(200).json(items);
    }

    // POST - Add new inventory item
    if (req.method === 'POST') {
      const { name, category, unit, min_stock } = req.body;

      if (!name || !category || !unit) {
        return res.status(400).json({ 
          error: 'Name, category, and unit are required' 
        });
      }

      const result = await sql`
        INSERT INTO inventory_items (name, category, unit, min_stock)
        VALUES (${name}, ${category}, ${unit}, ${min_stock || null})
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    }

    // PUT - Update inventory item
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, category, unit, min_stock } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      const result = await sql`
        UPDATE inventory_items
        SET 
          name = COALESCE(${name}, name),
          category = COALESCE(${category}, category),
          unit = COALESCE(${unit}, unit),
          min_stock = COALESCE(${min_stock}, min_stock),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE - Delete inventory item
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      const result = await sql`
        DELETE FROM inventory_items
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Item deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Inventory API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
