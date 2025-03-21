const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');  

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("❌ No token provided or incorrect format");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1]; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Decoded Token:", decoded);

    req.user = decoded; // Ensure entire user payload is available
    req.userId = decoded.userId; // ✅ Fix: Explicitly set req.userId

    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
