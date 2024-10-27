const express = require("express");
const cors = require("cors");
const multer = require("multer"); // Neue Abhängigkeit
const { initializeDatabase } = require("./db"); // Geändert zu destrukturiertem Import
const routes = require("./routes");
const app = express();

// Multer Konfiguration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Nur Bilddateien sind erlaubt!"), false);
    }
  },
});

// 1. CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. Body Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 3. Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method !== "GET" && !req.url.includes("/preview-image")) {
    const bodyToLog = { ...req.body };
    if (bodyToLog.image) bodyToLog.image = "[Image Data]";
    console.log("Request body:", bodyToLog);
  }
  const oldJson = res.json;
  res.json = function (data) {
    const dataToLog = { ...data };
    if (dataToLog.image) dataToLog.image = "[Image Data]";
    console.log("Response:", dataToLog);
    return oldJson.apply(res, arguments);
  };
  next();
});

// 4. Request Timeout
app.use((req, res, next) => {
  const timeout = req.url.includes("/preview-image") ? 30000 : 5000;
  req.setTimeout(timeout, () => {
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

    await db.get("SELECT 1");
    console.log(`${new Date().toISOString()} - Database connection verified`);

    app.use((req, res, next) => {
      req.db = db;
      req.upload = upload; // Multer verfügbar machen
      next();
    });

    app.use("/api", routes(db));

    app.use((req, res) => {
      console.log(
        `${new Date().toISOString()} - 404 Not Found: ${req.method} ${req.url}`,
      );
      res.status(404).json({ error: "Route not found" });
    });

    app.use((err, req, res, next) => {
      console.error(`${new Date().toISOString()} - Error:`, err);

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: "Die Datei darf nicht größer als 5MB sein.",
          });
        }
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    });

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(
        `${new Date().toISOString()} - Server running on port ${PORT}`,
      );
    });

    server.on("error", (error) => {
      console.error(`${new Date().toISOString()} - Server error:`, error);
      process.exit(1);
    });

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
