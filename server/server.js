const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./src/db');
const authRoutes = require('./src/routes/authRoutes.js');
const requestsRoutes = require('./src/routes/requests.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Routes
app.use("/auth", authRoutes);
app.use("/requests", requestsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 