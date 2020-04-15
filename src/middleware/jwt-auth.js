// Service to verify token
const AuthService = require("../auth/auth-service");

function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";
  let bearerToken;
  // Return error if bearer token is not provided
  if (!authToken.toLowerCase().startsWith("bearer")) {
    return res.status(401).json({ error: "Missing bearer token" });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  // Verify token if provided
  try {
    const payload = AuthService.verifyJWT(bearerToken);
    // Get username to identify if user exist in db
    AuthService.getUser(req.app.get("db"), payload.sub)
      // Return error if user doesn't exist
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: "Unauthorized request" });
        }
        req.user = user;
        next();
      })
      .catch(error => {
        next(error);
      });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized request" });
  }
}

module.exports = { requireAuth };
