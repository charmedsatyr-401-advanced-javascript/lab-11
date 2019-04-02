'use strict';

/**
 * Authentication router module - Allows signup (user creation) and signin authentication
 * @module auth/router.js
 */

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const auth = require('./middleware.js');

/**
 * @function
 * @name /signup POST route handler
 * @param  {object} req
 * @param  {object} res
 * @param  {object} next
 */
authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user
    .save()
    .then(user => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    })
    .catch(next);
});

/**
 * @function
 * @name /signin POST route handler
 * @param  {object} req
 * @param  {object} res
 * @param  {object} next
 */
authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

module.exports = authRouter;
