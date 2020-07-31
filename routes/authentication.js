const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('./../models/user');
const routeAuthenticationGuard = require('./../middleware/route-authentication-guard');

const authenticationRouter = new express.Router();

authenticationRouter.get('/sign-up', (request, response, next) => {
  response.render('authentication/sign-up');
});

authenticationRouter.post('/sign-up', async (request, response, next) => {
  const { name, email, password } = request.body;

  if (password.length < 8) {
    next(new Error('Password is too short.'));
    return;
  }

  try {
    const hashAndSalt = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHashAndSalt: hashAndSalt
    });
    request.session.userId = user._id;
    response.redirect('/');
  } catch (error) {
    next(error);
  }
});

authenticationRouter.get('/sign-in', (request, response, next) => {
  response.render('authentication/sign-in');
});

authenticationRouter.post('/sign-in', async (request, response, next) => {
  const { email, password } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No user with that email.');
    }
    const passwordHashAndSalt = user.passwordHashAndSalt;
    const comparison = await bcrypt.compare(password, passwordHashAndSalt);
    if (comparison) {
      request.session.userId = user._id;
      response.redirect('/');
    } else {
      throw new Error('Password did not match.');
    }
  } catch (error) {
    response.render('authentication/sign-in', { error: error });
  }
});

authenticationRouter.post('/sign-out', (request, response) => {
  request.session.destroy();
  response.redirect('/authentication/sign-in');
});

authenticationRouter.get('/profile', routeAuthenticationGuard, (request, response, next) => {
  response.render('authentication/profile');
});

module.exports = authenticationRouter;
