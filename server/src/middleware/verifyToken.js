const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // Firebase user info
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
