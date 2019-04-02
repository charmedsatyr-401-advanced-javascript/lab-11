'use strict';

/**
 * Users model - a mongoose schema with custom methods as validation helpers
 * @module auth/users-model.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, required: true, default: 'user', enum: ['admin', 'editor', 'user'] },
});

/**
 * A pre-save hook for the `users` object that
 * hashes passwords with `bcrypt` before they
 * are saved to the database.
 */
users.pre('save', function(next) {
  bcrypt
    .hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {
      throw error;
    });
});

/**
 * A static class method that queries the database for a user
 * and authenticates his password using the `bcrypt`-based
 * `comparePassword` method.
 */
users.statics.authenticateBasic = function(auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(console.error);
};

// Compare a plain text password against the hashed one we have saved
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password).then(valid => (valid ? this : null));
};

// Generate a JWT from the user id and a secret
users.methods.generateToken = function() {
  let tokenData = {
    id: this._id,
    capabilities: (this.acl && this.acl.capabilities) || [],
  };
  console.log(jwt.sign(tokenData, process.env.SECRET || 'changeit'));
  return jwt.sign(tokenData, process.env.SECRET || 'changeit');
};

module.exports = mongoose.model('users', users);
