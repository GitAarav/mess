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
    console.error("Error checking user:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const email = req.user.email;
    const { room_number, phone_number, default_mess_id } = req.body;

    // Validation
    if (!room_number || !phone_number || !default_mess_id) {
      return res.status(400).json({ 
        message: "All fields are required (room_number, phone_number, default_mess_id)" 
      });
    }

    // Check if already registered
    const existing = await pool.query(
      'SELECT * FROM "Users" WHERE email=$1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Verify mess_id exists
    const messCheck = await pool.query(
      'SELECT mess_id FROM "Messes" WHERE mess_id=$1',
      [default_mess_id]
    );

    if (messCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid mess_id. Please select a valid mess block." 
      });
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO "Users" (email, password_hash, room_number, phone_number, default_mess_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, room_number, phone_number, default_mess_id`,
      [email, "firebase", room_number, phone_number, default_mess_id]
    );

    console.log("User registered successfully:", result.rows[0]);
    
    res.status(201).json({ 
      message: "User registered successfully", 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};