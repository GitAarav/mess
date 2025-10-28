const pool = require('../db');

exports.checkUser = async (req, res) => {
  try {
    const email = req.user.email;

    const result = await pool.query(
      'SELECT * FROM "Users" WHERE email=$1',
      [email]
    );

    if (result.rows.length > 0) {
      return res.json({ exists: true, user: result.rows[0] });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.registerUser = async (req, res) => {
  try {
    const email = req.user.email;
    const { room_number, phone_number, default_mess_id } = req.body;

    // check if already registered
    const existing = await pool.query(
      'SELECT * FROM "Users" WHERE email=$1',
      [email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    // create user
    const result = await pool.query(
      `INSERT INTO "Users" (email, password_hash, room_number, phone_number, default_mess_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, "firebase", room_number, phone_number, default_mess_id]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
