const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`${new Date().toISOString()} - Error during logout:`, error);
    res.status(500).json({
      error: "An error occurred during logout",
      details: error.message,
    });
  }
};

module.exports = logout;
