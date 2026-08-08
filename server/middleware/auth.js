// AICTE Security & Governance Platform - M1 RBAC Authentication Middleware Simulation

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized Access', 
      message: 'M1 Security context missing. Authorization header required.' 
    });
  }

  // Parse header. Format: Bearer username:role
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      error: 'Unauthorized Access', 
      message: 'Invalid authorization format. Use Bearer <user>:<role>' 
    });
  }

  const credentials = parts[1].split(':');
  if (credentials.length !== 2) {
    return res.status(401).json({ 
      error: 'Unauthorized Access', 
      message: 'Credentials format mismatch. Expected username:role' 
    });
  }

  const username = credentials[0];
  const role = credentials[1];

  // Bind to request object
  req.user = { username, role };
  
  // Call next middleware
  next();
}

// Helper middleware to restrict routes to specific roles (RBAC)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden Access', 
        message: `M1 RBAC: Role '${req.user ? req.user.role : 'None'}' does not possess permissions to execute this operation.` 
      });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  authorizeRoles
};
