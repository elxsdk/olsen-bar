// Schedules API endpoints
import { getDb } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = getDb();

    // GET - Get schedule for a month or specific date
    if (req.method === 'GET') {
      const { month, date } = req.query;
      
      let schedules;
      
      if (date) {
        // Get specific date schedule
        schedules = await sql`
          SELECT 
            s.id,
            s.schedule_date,
            s.shift_type,
            s.barista_id,
            b.name as barista_name,
            b.role as barista_role,
            b.avatar as barista_avatar
          FROM schedules s
          JOIN baristas b ON s.barista_id = b.id
          WHERE s.schedule_date = ${date}
          ORDER BY s.shift_type, b.name
        `;
      } else if (month) {
        // Get month schedule (format: YYYY-MM)
        const [year, monthNum] = month.split('-');
        const startDate = `${year}-${monthNum}-01`;
        const endDate = `${year}-${monthNum}-31`;
        
        schedules = await sql`
          SELECT 
            s.id,
            s.schedule_date,
            s.shift_type,
            s.barista_id,
            b.name as barista_name,
            b.role as barista_role,
            b.avatar as barista_avatar
          FROM schedules s
          JOIN baristas b ON s.barista_id = b.id
          WHERE s.schedule_date BETWEEN ${startDate} AND ${endDate}
          ORDER BY s.schedule_date, s.shift_type, b.name
        `;
      } else {
        // Get all schedules (current month default)
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = String(now.getMonth() + 1).padStart(2, '0');
        const startDate = `${year}-${monthNum}-01`;
        const endDate = `${year}-${monthNum}-31`;
        
        schedules = await sql`
          SELECT 
            s.id,
            s.schedule_date,
            s.shift_type,
            s.barista_id,
            b.name as barista_name,
            b.role as barista_role,
            b.avatar as barista_avatar
          FROM schedules s
          JOIN baristas b ON s.barista_id = b.id
          WHERE s.schedule_date BETWEEN ${startDate} AND ${endDate}
          ORDER BY s.schedule_date, s.shift_type, b.name
        `;
      }

      // Transform to grouped format for frontend compatibility
      const grouped = {};
      schedules.forEach(row => {
        const dateStr = row.schedule_date.toISOString().split('T')[0];
        if (!grouped[dateStr]) {
          grouped[dateStr] = { morning: [], middle: [], evening: [] };
        }
        grouped[dateStr][row.shift_type].push(row.barista_id);
      });

      return res.status(200).json(grouped);
    }

    // POST - Update schedule for a date/shift
    if (req.method === 'POST') {
      const { date, shift, baristaIds } = req.body;

      if (!date || !shift || !Array.isArray(baristaIds)) {
        return res.status(400).json({ 
          error: 'Date, shift, and baristaIds array are required' 
        });
      }

      // Delete existing schedule for this date/shift
      await sql`
        DELETE FROM schedules 
        WHERE schedule_date = ${date} AND shift_type = ${shift}
      `;

      // Insert new schedule entries
      if (baristaIds.length > 0) {
        for (const baristaId of baristaIds) {
          await sql`
            INSERT INTO schedules (schedule_date, shift_type, barista_id)
            VALUES (${date}, ${shift}, ${baristaId})
            ON CONFLICT (schedule_date, shift_type, barista_id) DO NOTHING
          `;
        }
      }

      return res.status(200).json({ 
        success: true, 
        date, 
        shift, 
        baristaIds 
      });
    }

    // DELETE - Clear schedule for a date
    if (req.method === 'DELETE') {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      await sql`DELETE FROM schedules WHERE schedule_date = ${date}`;
      
      return res.status(200).json({ success: true, message: 'Schedule cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Schedules API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
