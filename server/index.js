const { db } = require("./services/firebase");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');

const voteRoutes = require('./routes/vote');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', voteRoutes);

app.get('/', (req, res) => {
    res.send('Voting App Backend is running');
});
db.collection("students")
  .limit(1)
  .get()
  .then(() => console.log("🔥 Firebase connected successfully"))
  .catch(err => console.error("❌ Firebase error:", err));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
