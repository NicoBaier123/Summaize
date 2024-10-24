const login = (req, res, db) => {
  try {
    const { login, password } = req.body;

    // check login data presence
    if (!login) {
      return res.status(400).json({ error: "missing_login" });
    } else if (!password) {
      return res.status(400).json({ error: "missing_password" });
    }

    // Perform login logic here

    // Send response
    res.json({ message: "login_success" });
  } catch (error) {
    console.error(`${new Date().toISOString()} - Error during login:`, error);
    res.status(500).json({
      error: "An error occurred during login",
      details: error.message,
    });
  }
};

module.exports = login;
