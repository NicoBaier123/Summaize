const bcrypt = require("bcrypt");

const login = async (req, res, db, jwt, jwt_secret) => {
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

    const user = await db.get(queryUserQuery, [login, login]);

    if (!user) {
      return res.status(401).json({ error: "login_failed_user_not_found" });
    } else {
      const { id, password_hash } = user;
      const match = await bcrypt.compare(password, password_hash);
      if (!match) {
        return res.status(401).json({ error: "login_failed_wrong_pass" });
      } else if (match) {
        jwt.sign(
          { id },
          jwt_secret,
          { algorithm: "HS256", expiresIn: "2d" },
          (err, token) => {
            if (err) {
              console.error(
                `${new Date().toISOString()} - Error signing token:`,
                err,
              );
              res.status(500).json({
                error: "An error occurred during login",
                details: err.message,
              });
            } else {
              res.json({ token });
            }
          },
        );
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
