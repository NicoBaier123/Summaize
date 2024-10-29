bcrypt = require("bcrypt");
const login = async (req, res, db, jwt, jwt_secret) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "missing_credentials" });
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

    const { id, password_hash } = user;
    const match = await bcrypt.compare(password, password_hash);

    if (!match) {
      return res.status(401).json({ error: "login_failed_wrong_pass" });
    }

    const token = jwt.sign({ id }, jwt_secret, {
      algorithm: "HS256",
      expiresIn: "2d",
    });

    // Setze das Cookie mit korrekten Optionen
    res.cookie("token", token, {
      httpOnly: false, // Änderung hier, damit JavaScript das Cookie lesen kann
      secure: false, // false für lokale Entwicklung
      sameSite: "lax",
      path: "/",
      domain: "localhost", // Explizit für Entwicklung
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    // Debug-Log
    console.log("Setting cookie:", {
      token,
      cookies: res.getHeader("Set-Cookie"),
    });

    res.json({
      token,
      message: "Login successful",
      userId: id,
    });
  } catch (error) {
    console.error(`${new Date().toISOString()} - Error during login:`, error);
    res.status(500).json({
      error: "An error occurred during login",
      details: error.message,
    });
  }
};

module.exports = login;
