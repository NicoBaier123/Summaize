const express = require("express");
const cors = require("cors");
const initializeDatabase = require("./db");
const routes = require("./routes");

const app = express();

// Erweiterte Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method !== "GET") {
    console.log("Request body:", req.body);
  }

  // Response Logging
  const oldJson = res.json;
  res.json = function (data) {
    console.log("Response:", data);
    return oldJson.apply(res, arguments);
  };

  next();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// CORS-Konfiguration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser Middleware mit Größenbegrenzung
app.use(express.json({ limit: "10mb" }));

// Globaler Request Timeout
app.use((req, res, next) => {
  req.setTimeout(5000, () => {
    console.error(
      `${new Date().toISOString()} - Request timeout for ${req.method} ${req.url}`,
    );
    res.status(408).json({ error: "Request timeout" });
  });
  next();
});

let db;

async function startServer() {
  try {
    console.log(`${new Date().toISOString()} - Initializing database...`);
    db = await initializeDatabase();

    // Teste Datenbankverbindung
    await db.get("SELECT 1");
    console.log(`${new Date().toISOString()} - Database connection verified`);

    // Stelle db dem Request-Objekt zur Verfügung
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    app.use("/api", routes(db));

    // 404 Handler
    app.use((req, res) => {
      console.log(
        `${new Date().toISOString()} - 404 Not Found: ${req.method} ${req.url}`,
      );
      res.status(404).json({ error: "Route not found" });
    });

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(
        `${new Date().toISOString()} - Server running on port ${PORT}`,
      );
    });

    // Server Error Handler
    server.on("error", (error) => {
      console.error(`${new Date().toISOString()} - Server error:`, error);
      process.exit(1);
    });

    // Graceful Shutdown
    process.on("SIGTERM", () => {
      console.log(
        `${new Date().toISOString()} - SIGTERM received. Closing server...`,
      );
      server.close(async () => {
        console.log(
          `${new Date().toISOString()} - Server closed. Closing database...`,
        );
        await db.close();
        console.log(
          `${new Date().toISOString()} - Database closed. Exiting...`,
        );
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Failed to start server:`,
      error,
    );
    process.exit(1);
  }
}

// Globale Fehlerbehandlung
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    `${new Date().toISOString()} - Unhandled Rejection at:`,
    promise,
    "reason:",
    reason,
  );
});

process.on("uncaughtException", (error) => {
  console.error(`${new Date().toISOString()} - Uncaught Exception:`, error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error(
    `${new Date().toISOString()} - Error during server startup:`,
    error,
  );
  process.exit(1);
});
