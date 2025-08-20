const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({msg: "Unauthorized. Please add valid token"});
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { id, name } = decoded
    
    // Get full user info including role
    const user = await User.findById(id).select('-password')
    if (!user) {
      return res.status(401).json({msg: "User not found"});
    }
    
    req.user = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role || 'user',
      profilePicture: user.profilePicture 
    }
    next()
  } catch (error) {
    return res.status(401).json({msg: "Unauthorized. Please add valid token"});
  }
}

const requireSuperuser = async (req, res, next) => {
  if (req.user.role !== 'superuser') {
    return res.status(403).json({
      success: false,
      msg: "Access denied. Superuser privileges required."
    });
  }
  next();
}

module.exports = {
  authenticationMiddleware,
  requireSuperuser
}