const bcrypt = require("bcrypt");

const register = (req, res, db) => {
  try {
    console.log(req.body);
    const { login, email, password } = req.body;

    // Validate login data
    if (!login) {
      return res.status(400).json({ error: "missing_login" });
    } else if (!password) {
      return res.status(400).json({ error: "missing_password" });
    } else if (!email) {
      return res.status(400).json({ error: "missing_email" });
    }

    bcrypt.hash(password, 10, async (hashError, hashedPassword) => {
      if (hashError) {
        console.error(
          `${new Date().toISOString()} - Error hashing password:`,
          hashError,
        );
        return res.status(500).json({
          error: "registration_error",
          details: hashError.message,
        });
      }

      const checkUserExistsQuery = `
        SELECT id
        FROM users
        WHERE username = ? OR email = ?;
        `;
      const existingUser = await db.get(checkUserExistsQuery, [login, email]);

      if (existingUser) {
        return res.status(400).json({ error: "user_exists" });
      }

      // Insert user into database
      const insertUserQuery = `
      INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?);
      `;
      try {
        await db.run(insertUserQuery, [login, email, hashedPassword]);
      } catch (error) {
        console.error(
          `${new Date().toISOString()} - Error inserting user:`,
          error,
        );
        return res.status(500).json({
          error: "registration_error",
          details: error.message,
        });
      }

      return res.json({ message: "registration_success" });
    });

    // Send error response
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
};

module.exports = register;
