const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.user = decoded;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authenticateToken;
