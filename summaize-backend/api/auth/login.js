const bcrypt = require("bcrypt");

const login = async (req, res, db) => {
  try {
    const { login, password } = req.body;

    // check login data presence
    if (!login) {
      return res.status(400).json({ error: "missing_login" });
    } else if (!password) {
      return res.status(400).json({ error: "missing_password" });
    }

    const queryUserQuery = `
      SELECT id, password_hash
      FROM users
      WHERE username = ? OR email = ?;
    `;

    const { id, password_hash } = await db.get(queryUserQuery, [login, login]);

    if (!id) {
      return res.status(401).json({ error: "login_failed_missing_id" });
    } else {
      const match = await bcrypt.compare(password, password_hash);
      if (!match) {
        return res.status(401).json({ error: "login_failed_wrong_pass" });
      } else if (match) {
        // Send response
        res.json({ message: "login_success" });
      }
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} - Error during login:`, error);
    res.status(500).json({
      error: "An error occurred during login",
      details: error.message,
    });
  }
};

module.exports = login;
