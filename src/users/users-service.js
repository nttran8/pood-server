// Library
const xss = require("xss");
const bcrypt = require("bcryptjs");

// Ensure pw has upper, lower, number and special char
const REGEX_Validation_pw = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const REGEX_Validation_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UsersService = {
  // Insert data
  insertUser(knex, user) {
    return knex("users")
      .insert(user)
      .returning("*")
      .then(([user]) => user);
  },
  // Check for username
  checkUsername(knex, username) {
    return knex("users")
      .where({ username: username })
      .first()
      .then(user => !!user);
  },
  // Get data by id
  getUserById(knex, id) {
    return knex("users")
      .select("*")
      .where({ id })
      .first();
  },
  // Update data
  updateUser(knex, id, user) {
    return knex("users")
      .where({ id })
      .update(user);
  },
  // Remove data
  deleteUser(knex, id) {
    return knex("users")
      .where({ id })
      .delete();
  },
  // Serialize data
  serializeUser(user) {
    return {
      id: user.id,
      fullname: xss(user.fullname),
      email: xss(user.email),
      username: xss(user.username),
      date_created: user.date_created,
      date_modified: user.date_modified,
      gender: user.gender
    };
  },
  // Check password
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password must be lessthan 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_Validation_pw.test(password)) {
      return "Password must contain 1 uppercase, lowercase, number, and special character";
    }
    return null;
  },
  // Encrypt password
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  // Validate email
  validateEmail(email) {
    if (!REGEX_Validation_email.test(email)) {
      return "Email must contain a domain name such as name@example.com";
    }
    return null;
  }
};

module.exports = UsersService;
