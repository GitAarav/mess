const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Validate required environment variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Missing required environment variable: FIREBASE_SERVICE_ACCOUNT");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON format");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
