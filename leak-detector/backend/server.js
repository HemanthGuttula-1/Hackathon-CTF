import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';  // Main Express app

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Setup required'}`);
});