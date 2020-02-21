// Library
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get configured token secret
const config = require('../config');

const AuthService = {
  getUser(db, username) {
    return db('users')
      .where('username', username)
      .first();
  },
  checkPasswords(pwEntered, pwStored) {
    // Compare pw with hash stored
    return bcrypt.compare(pwEntered, pwStored);
  },
  createJWT(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    })
  },
  verifyJWT(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  }
}

module.exports = AuthService;