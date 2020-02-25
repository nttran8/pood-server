// Library
const express = require("express");
const path = require("path");

// Service
const UsersService = require("./users-service");
const { requireAuth } = require("../middleware/jwt-auth");

// Router
const usersRouter = express.Router();

// Middleware
const jsonBodyParser = express.json();

usersRouter.route("/").post(jsonBodyParser, (req, res, next) => {
  const { email, username, password } = req.body;

  // Validate existence of required data
  for (const field of ["email", "username", "password"])
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Request body must include ${field}`
      });
    }

  // Validate email
  const emailError = UsersService.validateEmail(email);
  if (emailError) {
    return res.status(400).json({ error: emailError });
  }

  // Validate password
  const passwordError = UsersService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  // Validate username existence
  UsersService.checkUsername(req.app.get("db"), username)
    .then(usernameExist => {
      // Return error if username exist
      if (usernameExist) {
        return res.status(400).json({ error: `Username already taken` });
      }

      return UsersService.hashPassword(password).then(hashedPW => {
        // Put together new user object
        const newUser = {
          email: email.toLowerCase(),
          username,
          password: hashedPW
        };
        // Add user
        return UsersService.insertUser(req.app.get("db"), newUser).then(user =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(UsersService.serializeUser(user))
        );
      });
    })
    .catch(next);
});

usersRouter
  .route("/:id")
  .all(requireAuth)
  .delete((req, res, next) => {
    // Ensure user is requesting to delete their own account
    if (!req.user.id == req.params.id) {
      return res.status(401).json({
        error: "Cannot delete user"
      });
    }
    UsersService.deleteUser(req.app.get("db"), req.user.id)
      .then(() => res.status(204).end())
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { fullname, email, password, gender } = req.body;
    const criteria = { fullname, email, password, gender };
    // Check for any input
    const checkForChange = Object.values(criteria).filter(Boolean).length;
    if (checkForChange === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'email', 'fullname', 'password', or 'gender'`
      });
    }

    // ---------- Validate data

    // Validate gender
    const genderOption = ["female", "male"];
    if (criteria.gender != null && !genderOption.includes(criteria.gender)) {
      return res
        .status(400)
        .json({ error: `'Gender' value could only be either female or male` });
    }
    criteria.email = email.toLowerCase();

    // Return error if the above field is included but empty in the request body
    for (const field of ["email", "password"])
      if (req.body.hasOwnProperty(field) && !req.body[field]) {
        return res.status(400).json({
          error: `Request body must include a value for '${field}'`
        });
      }

    // Validate email
    if (req.body.hasOwnProperty("email")) {
      const emailError = UsersService.validateEmail(email);
      if (emailError) {
        return res.status(400).json({ error: emailError });
      }
    }

    if (req.body.hasOwnProperty("password")) {
      const passwordError = UsersService.validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }
      return UsersService.hashPassword(password).then(hashedPW => {
        criteria.password = hashedPW;
        return updateUser(criteria, req, res, next);
      });
    }
    return updateUser(criteria, req, res, next);
  });

function updateUser(criteria, req, res, next) {
  // Complete building user object
  let userToUpdate = {};
  for (const [key, value] of Object.entries(criteria))
    if (criteria[key] !== undefined) {
      userToUpdate[key] = value;
    }

  const date_modified = new Date();
  userToUpdate.date_modified = date_modified;
  UsersService.updateUser(req.app.get("db"), req.user.id, userToUpdate)
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = usersRouter;
