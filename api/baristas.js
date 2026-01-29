// Baristas API endpoints
import { getDb } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = getDb();

    // GET - List all baristas
    if (req.method === 'GET') {
      const baristas = await sql`
        SELECT id, name, role, avatar, created_at 
        FROM baristas 
        ORDER BY id ASC
      `;
      return res.status(200).json(baristas);
    }

    // POST - Add new barista
    if (req.method === 'POST') {
      const { name, role, avatar } = req.body;
      
      if (!name || !role) {
        return res.status(400).json({ error: 'Name and role are required' });
      }

      const generatedAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4a373&color=fff`;
      
      const result = await sql`
        INSERT INTO baristas (name, role, avatar)
        VALUES (${name}, ${role}, ${generatedAvatar})
        RETURNING id, name, role, avatar, created_at
      `;
      
      return res.status(201).json(result[0]);
    }

    // PUT - Update barista
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, role, avatar } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Barista ID is required' });
      }

      const result = await sql`
        UPDATE baristas 
        SET 
          name = COALESCE(${name}, name),
          role = COALESCE(${role}, role),
          avatar = COALESCE(${avatar}, avatar)
        WHERE id = ${parseInt(id)}
        RETURNING id, name, role, avatar, created_at
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Barista not found' });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE - Delete barista
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Barista ID is required' });
      }

      await sql`DELETE FROM baristas WHERE id = ${parseInt(id)}`;
      
      return res.status(200).json({ success: true, message: 'Barista deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Baristas API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
