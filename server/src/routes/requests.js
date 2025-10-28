const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/verifyToken");


// Create a new item request
router.post("/", verifyToken, async (req, res) => {
  try {
    const { item_name, price_offered, delivery_mess_id } = req.body;
    const email = req.user.email;

    const userResult = await pool.query(
      `SELECT user_id FROM "Users" WHERE email = $1`,
      [email]
    );
    const requester_id = userResult.rows[0]?.user_id;
    if (!requester_id) return res.status(404).json({ message: "User not found" });

    const result = await pool.query(
      `INSERT INTO "Requests" (item_name, price_offered, requester_id, delivery_mess_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [item_name, price_offered, requester_id, delivery_mess_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create request" });
  }
});

// Public route — fetch all unclaimed requests
router.get("/open", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.room_number, u.phone_number, m.mess_block
       FROM "Requests" r
       JOIN "Users" u ON r.requester_id = u.user_id
       JOIN "Messes" m ON r.delivery_mess_id = m.mess_id
       WHERE r.status = 'open'`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch open requests" });
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
    const fulfiller_id = userResult.rows[0]?.user_id;

    const result = await pool.query(
      `UPDATE "Requests"
       SET fulfiller_id = $1, status = 'in_progress'
       WHERE request_id = $2 AND status = 'open'
       RETURNING *`,
      [fulfiller_id, id]
    );

    if (result.rowCount === 0)
      return res.status(400).json({ message: "Request not found or already claimed" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept request" });
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
    const user_id = userResult.rows[0]?.user_id;

    const result = await pool.query(
      `SELECT * FROM "Requests"
       WHERE fulfiller_id = $1 AND status = 'in_progress'`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch active requests" });
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
    const user_id = userResult.rows[0]?.user_id;

    const result = await pool.query(
      `UPDATE "Requests"
       SET status = 'completed'
       WHERE request_id = $1 AND fulfiller_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (result.rowCount === 0)
      return res.status(403).json({ message: "Not authorized or already completed" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark request as completed" });
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
    const user_id = userResult.rows[0]?.user_id;

    const result = await pool.query(
      `SELECT * FROM "Requests"
       WHERE requester_id = $1 AND status = 'completed'`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order history" });
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
    const user_id = userResult.rows[0]?.user_id;

    const result = await pool.query(
      `SELECT * FROM "Requests"
       WHERE fulfiller_id = $1 AND status = 'completed'`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch delivery history" });
  }
});

module.exports = router;
