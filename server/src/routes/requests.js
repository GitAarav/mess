const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/verifyToken");

// Create a new item request
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const email = req.user.email;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Get user info
    const userResult = await pool.query(
      `SELECT user_id, default_mess_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { user_id: requester_id, default_mess_id } = userResult.rows[0];

    // Insert request using schema fields: item_name, price_offered
    const result = await pool.query(
      `INSERT INTO "Requests" (item_name, price_offered, requester_id, delivery_mess_id, status)
       VALUES ($1, $2, $3, $4, 'open') RETURNING *`,
      [title, parseFloat(description) || 0, requester_id, default_mess_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ message: "Failed to create request", error: err.message });
  }
});

// Public route — fetch all unclaimed requests
router.get("/open", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        r.request_id as id,
        r.item_name as title,
        r.price_offered as description,
        r.status,
        r.created_at,
        u.room_number,
        u.phone_number,
        m.mess_block
       FROM "Requests" r
       JOIN "Users" u ON r.requester_id = u.user_id
       JOIN "Messes" m ON r.delivery_mess_id = m.mess_id
       WHERE r.status = 'open'
       ORDER BY r.created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Fetch open requests error:', err);
    res.status(500).json({ message: "Failed to fetch open requests", error: err.message });
  }
});

// Claim a request (set fulfiller_id)
router.patch("/:id/accept", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user.email;

    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const fulfiller_id = userResult.rows[0].user_id;

    const result = await pool.query(
      `UPDATE "Requests"
       SET fulfiller_id = $1, status = 'in_progress'
       WHERE request_id = $2 AND status = 'open'
       RETURNING *`,
      [fulfiller_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Request not found or already claimed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ message: "Failed to accept request", error: err.message });
  }
});

// Fetch requests claimed by the logged-in user
router.get("/active", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = userResult.rows[0].user_id;

    const result = await pool.query(
      `SELECT 
        r.request_id as id,
        r.item_name as title,
        r.price_offered as description,
        r.status,
        r.created_at
       FROM "Requests" r
       WHERE r.fulfiller_id = $1 AND r.status = 'in_progress'
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Fetch active requests error:', err);
    res.status(500).json({ message: "Failed to fetch active requests", error: err.message });
  }
});

// Mark a request as completed
router.patch("/:id/complete", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user.email;

    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = userResult.rows[0].user_id;

    const result = await pool.query(
      `UPDATE "Requests"
       SET status = 'completed'
       WHERE request_id = $1 AND fulfiller_id = $2 AND status = 'in_progress'
       RETURNING *`,
      [id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not authorized or already completed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Complete request error:', err);
    res.status(500).json({ message: "Failed to mark request as completed", error: err.message });
  }
});

// Past requests made by the logged-in user
router.get("/history/my-orders", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = userResult.rows[0].user_id;

    const result = await pool.query(
      `SELECT 
        r.request_id as id,
        r.item_name as title,
        r.price_offered as description,
        r.status,
        r.created_at
       FROM "Requests" r
       WHERE r.requester_id = $1 AND r.status = 'completed'
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Fetch order history error:', err);
    res.status(500).json({ message: "Failed to fetch order history", error: err.message });
  }
});

// Past deliveries completed by the logged-in user
router.get("/history/my-deliveries", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = userResult.rows[0].user_id;

    const result = await pool.query(
      `SELECT 
        r.request_id as id,
        r.item_name as title,
        r.price_offered as description,
        r.status,
        r.created_at
       FROM "Requests" r
       WHERE r.fulfiller_id = $1 AND r.status = 'completed'
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Fetch delivery history error:', err);
    res.status(500).json({ message: "Failed to fetch delivery history", error: err.message });
  }
});

module.exports = router;