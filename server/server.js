const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./src/db');
const authRoutes = require('./src/routes/authRoutes.js');
  

dotenv.config();

const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.json({message: 'ok route'});
})

app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
