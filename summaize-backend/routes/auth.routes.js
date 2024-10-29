const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function authRoutes(db, jwt_secret) {
  const router = express.Router();

  // Login route
  router.post("/login", async (req, res) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          error: login ? "missing_password" : "missing_login",
        });
      }

      const queryUserQuery = `
        SELECT id, password_hash
        FROM users
        WHERE username = ? OR email = ?;
      `;

      const user = await db.get(queryUserQuery, [login, login]);

      if (!user) {
        return res.status(401).json({ error: "login_failed_user_not_found" });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: "login_failed_wrong_pass" });
      }

      jwt.sign(
        { id: user.id },
        jwt_secret,
        { algorithm: "HS256", expiresIn: "2d" },
        (err, token) => {
          if (err) {
            console.error(
              `${new Date().toISOString()} - Error signing token:`,
              err,
            );
            return res.status(500).json({
              error: "An error occurred during login",
              details: err.message,
            });
          }
          res.json({ token });
        },
      );
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error during login:`, error);
      res.status(500).json({
        error: "An error occurred during login",
        details: error.message,
      });
    }
  });

  // Registration route
  router.post("/register", async (req, res) => {
    try {
      const { login, email, password } = req.body;

      if (!login || !password || !email) {
        return res.status(400).json({
          error: `missing_${!login ? "login" : !password ? "password" : "email"}`,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const checkUserExistsQuery = `
        SELECT id
        FROM users
        WHERE username = ? OR email = ?;
      `;

      const existingUser = await db.get(checkUserExistsQuery, [login, email]);
      if (existingUser) {
        return res.status(400).json({ error: "user_exists" });
      }

      const insertUserQuery = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?);
      `;

      await db.run(insertUserQuery, [login, email, hashedPassword]);
      res.json({ message: "registration_success" });
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error during registration:`,
        error,
      );
      res.status(500).json({
        error: "registration_error",
        details: error.message,
      });
    }
  });

  return router;
}

module.exports = authRoutes;
