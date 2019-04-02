'use strict';

/**
 * Authentication middleware module
 * @module auth/middleware
 */

// Import the mongoose user model
const User = require('./users-model.js');

/**
 * Parses authorization headers and uses internal methods to validate user.
 * @function
 * @name authentication middleware
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
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
   * Parses authentication header and passes it into a user model method `authenticateBasic`
   * @function
   * @name _authBasic
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
   * Attaches `user` object and authentication token to the request object.
   * @function
   * @name _authenticate
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
   * Calls the `next` middleware with an error object.
   * @function
   * @name _authError
   */
  function _authError() {
    next({ status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password' });
  }
};
