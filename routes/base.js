const express = require('express');
const Router = express.Router;

const Post = require('./../models/post');

const baseRouter = new Router();

baseRouter.get('/', async (request, response, next) => {
  try {
    const posts = await Post.find().populate('creator');
    response.render('home', { posts });
  } catch (error) {
    next(error);
  }
});

module.exports = baseRouter;
