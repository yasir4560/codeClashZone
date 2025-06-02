const jwt = require('jsonwebtoken');

function handleCheckAuth(req, res,next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    // res.status(200).json({ user }); 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = { handleCheckAuth };
