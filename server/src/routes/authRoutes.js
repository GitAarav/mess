const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");
const { checkUser, registerUser } = require("../controllers/authController.js");

const router = express.Router();

router.get("/check", verifyToken, checkUser);   
router.post("/register", verifyToken, registerUser); 

module.exports = router;
