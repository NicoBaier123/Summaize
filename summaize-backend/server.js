const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: 'http://localhost:8080'
}));
app.use(express.json());

let db;

async function startServer() {
  db = await initializeDatabase();
  
  app.use('/api', routes(db));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

