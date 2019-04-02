'use strict';

/**
 * Authentication middleware module
 * @module auth/middleware
 */

// Import the mongoose user model
const User = require('./users-model.js');

/**
 * @function
 * @name authentication middleware
 * @param  {object} req
 * @param  {object} res
 * @param  {object} next
 */
module.exports = (req, res, next) => {
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);

    switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      default:
        return _authError();
    }
  } catch (e) {
    return _authError();
  }

  /**
   * @function
   * @name _authBasic Parses authentication header and passes it into a user model method `authenticateBasic`
   * @param authString {string} Base64 encoding of the `id` and `password` joined by a colon.
   */
  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString, 'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username, password] = bufferString.split(':'); // variables username="john" and password="mysecret"
    let auth = { username, password }; // {username:"john", password:"mysecret"}

    return User.authenticateBasic(auth).then(user => _authenticate(user));
  }

  /**
   * @function
   * @name _authenticate Attaches `user` object and authentication token to the request object.
   * @param user {object} The `user` object validated by `bcrypt`
   */
  function _authenticate(user) {
    if (user) {
      req.token = user.generateToken();
      req.user = user;
      next();
    } else {
      _authError();
    }
  }
  /**
   * @function
   * @name _authError Calls the `next` middleware with an error object.
   */
  function _authError() {
    next({ status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password' });
  }
};
