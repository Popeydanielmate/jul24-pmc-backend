const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Authenticated user:', req.user); 
    next();
  } catch (err) {
    console.error('Token verification failed:', err); 
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;

