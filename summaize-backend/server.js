const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { initializeDatabase } = require("./db");
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

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request Timeout
app.use((req, res, next) => {
  const timeout = req.url.includes("/preview-image") ? 30000 : 5000;
  req.setTimeout(timeout, () => {
    res.status(408).json({ error: "Request timeout" });
  });
  next();
});

let db;

async function startServer() {
  try {
    db = await initializeDatabase();
    await db.get("SELECT 1");

    app.use((req, res, next) => {
      req.db = db;
      req.upload = upload;
      next();
    });

    app.use("/api", routes(db));

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    // Error Handler
    app.use((err, req, res, next) => {
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
    const server = app.listen(PORT);

    // Graceful Shutdown
    process.on("SIGTERM", () => {
      server.close(async () => {
        await db.close();
        process.exit(0);
      });
    });
  } catch (error) {
    process.exit(1);
  }
}

// Globale Fehlerbehandlung
process.on("unhandledRejection", (reason, promise) => {
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  process.exit(1);
});

startServer().catch(() => process.exit(1));
