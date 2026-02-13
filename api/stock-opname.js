// Stock Opname API
import { getDb } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();

  try {
    // GET - Fetch stock opname for a specific date or date range
    if (req.method === 'GET') {
      const { date, from, to, item_id } = req.query;

      // Get stock opname for specific date
      if (date) {
        let opnameRecords;
        
        if (item_id) {
          opnameRecords = await sql`
            SELECT so.*, ii.name, ii.category, ii.unit
            FROM stock_opname so
            JOIN inventory_items ii ON so.item_id = ii.id
            WHERE so.opname_date = ${date} AND so.item_id = ${item_id}
            ORDER BY ii.category, ii.name
          `;
        } else {
          opnameRecords = await sql`
            SELECT so.*, ii.name, ii.category, ii.unit
            FROM stock_opname so
            JOIN inventory_items ii ON so.item_id = ii.id
            WHERE so.opname_date = ${date}
            ORDER BY ii.category, ii.name
          `;
        }
        
        return res.status(200).json(opnameRecords);
      }

      // Get stock opname history (date range)
      if (from && to) {
        const history = await sql`
          SELECT so.*, ii.name, ii.category, ii.unit
          FROM stock_opname so
          JOIN inventory_items ii ON so.item_id = ii.id
          WHERE so.opname_date BETWEEN ${from} AND ${to}
          ORDER BY so.opname_date DESC, ii.category, ii.name
        `;
        
        return res.status(200).json(history);
      }

      return res.status(400).json({ 
        error: 'Please provide either date or from/to parameters' 
      });
    }

    // POST - Submit stock opname
    if (req.method === 'POST') {
      const { item_id, opname_date, actual_stock, stock_in = 0, notes, created_by } = req.body;

      if (!item_id || !opname_date || actual_stock === undefined) {
        return res.status(400).json({ 
          error: 'item_id, opname_date, and actual_stock are required' 
        });
      }

      // Get last stock (beginning stock) from most recent previous stock_opname
      let beginning_stock = 0;
      
      // Find the most recent opname BEFORE this date for this item
      const prevOpname = await sql`
        SELECT actual_stock 
        FROM stock_opname 
        WHERE item_id = ${item_id} AND opname_date < ${opname_date}
        ORDER BY opname_date DESC
        LIMIT 1
      `;

      if (prevOpname.length > 0) {
        beginning_stock = parseFloat(prevOpname[0].actual_stock);
      }

      // Calculate stock values
      const stockInValue = parseFloat(stock_in) || 0;
      const actualStockValue = parseFloat(actual_stock);
      const expected_stock = beginning_stock + stockInValue;
      const stock_out = expected_stock - actualStockValue;
      const variance = stock_out; // For now, variance = stock_out

      // Insert or update stock opname
      const result = await sql`
        INSERT INTO stock_opname (
          item_id, opname_date, beginning_stock, stock_in, 
          expected_stock, actual_stock, stock_out, variance, 
          notes, created_by
        )
        VALUES (
          ${item_id}, ${opname_date}, ${beginning_stock}, ${stockInValue},
          ${expected_stock}, ${actualStockValue}, ${stock_out}, ${variance},
          ${notes || null}, ${created_by || null}
        )
        ON CONFLICT (item_id, opname_date)
        DO UPDATE SET
          beginning_stock = ${beginning_stock},
          stock_in = ${stockInValue},
          actual_stock = ${actualStockValue},
          expected_stock = ${expected_stock},
          stock_out = ${stock_out},
          variance = ${variance},
          notes = ${notes || null},
          created_by = ${created_by || null}
        RETURNING *
      `;

      // Also create transaction record
      if (stock_out > 0) {
        await sql`
          INSERT INTO stock_transactions (
            item_id, transaction_date, transaction_type, quantity,
            last_stock, current_stock, notes, created_by
          )
          VALUES (
            ${item_id}, ${opname_date}, 'OUT', ${stock_out},
            ${expected_stock}, ${actualStockValue}, ${notes || 'Stock opname'}, ${created_by || null}
          )
        `;
      }

      if (stockInValue > 0) {
        await sql`
          INSERT INTO stock_transactions (
            item_id, transaction_date, transaction_type, quantity,
            last_stock, current_stock, notes, created_by
          )
          VALUES (
            ${item_id}, ${opname_date}, 'IN', ${stockInValue},
            ${beginning_stock}, ${beginning_stock + stockInValue}, ${notes || 'Stock in'}, ${created_by || null}
          )
        `;
      }

      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Stock opname API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
