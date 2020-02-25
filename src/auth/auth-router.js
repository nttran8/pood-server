// Library
const express = require("express");
const AuthService = require("./auth-service");

// Router
const authRouter = express.Router();

// Middleware
const { requireAuth } = require("../middleware/jwt-auth");
const jsonBodyParser = express.json();

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { username, password } = req.body;
  const authUser = { username, password };
  console.log(authUser);

  // Check for existence of username and password in request body
  for (const [key, value] of Object.entries(authUser))
    if (value == null)
      return res.status(400).json({
        error: `Please include '${key}' in the body`
      });

  // Get user from database
  AuthService.getUser(req.app.get("db"), authUser.username)
    .then(user => {
      // Return error if user doesn't exist
      if (!user) {
        return res.status(400).json({
          error: "Username or password is incorrect"
        });
      }
      // Return error if password doesn't match bcrypted password
      return AuthService.checkPasswords(authUser.password, user.password).then(
        match => {
          if (!match) {
            return res.status(400).json({
              error: "Username or password is incorrect"
            });
          }
          // Return token if username and password are valid
          const sub = user.username;
          const payload = { user_id: user.id };
          res.send({
            authToken: AuthService.createJWT(sub, payload)
          });
        }
      );
    })
    .catch(next);
});

authRouter.post("/refresh", requireAuth, (req, res) => {
  const sub = req.user.username;
  const payload = { user_id: req.user.id };
  // Validate previous token and send new token
  res.send({
    authToken: AuthService.createJWT(sub, payload)
  });
});

module.exports = authRouter;
