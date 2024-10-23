const express = require("express");
const cors = require("cors");
const initializeDatabase = require("./db");
const routes = require("./routes");

const app = express();

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS-Konfiguration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

let db;

async function startServer() {
  try {
    console.log(`${new Date().toISOString()} - Initializing database...`);
    db = await initializeDatabase();
    console.log(
      `${new Date().toISOString()} - Database initialized successfully`,
    );

    app.use("/api", routes(db));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(
        `${new Date().toISOString()} - Server running on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Failed to start server:`,
      error,
    );
    process.exit(1);
  }
}

// Fehlerbehandlung für unbehandelte Promises
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    `${new Date().toISOString()} - Unhandled Rejection at:`,
    promise,
    "reason:",
    reason,
  );
  // Anwendung beenden oder andere Maßnahmen ergreifen
});

startServer().catch((error) => {
  console.error(
    `${new Date().toISOString()} - Error during server startup:`,
    error,
  );
});
