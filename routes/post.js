const express = require('express');

const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

const Post = require('./../models/post');
const routeAuthenticationGuard = require('./../middleware/route-authentication-guard');

const postRouter = new express.Router();

postRouter.get('/create', routeAuthenticationGuard, (request, response) => {
  response.render('post/create');
});

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2
});
const upload = multer({ storage });

postRouter.post(
  '/create',
  routeAuthenticationGuard,
  upload.single('photo'),
  (request, response, next) => {
    const { content } = request.body;
    let url;
    if (request.file) {
      url = request.file.path;
    }

    Post.create({
      content,
      creator: request.session.userId,
      photo: url
    })
      .then(post => {
        response.redirect('/');
      })
      .catch(error => {
        next(error);
      });
  }
);

postRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id;

  try {
    const post = await Post.findById(id).populate('creator');
    if (post) {
      response.render('post/single', { post: post });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

postRouter.post('/:id/delete', routeAuthenticationGuard, async (request, response, next) => {
  const id = request.params.id;
  const userId = request.session.userId;

  try {
    await Post.findOneAndDelete({ _id: id, creator: userId });
    response.redirect('/');
  } catch (error) {
    next(error);
  }
});

postRouter.get('/:id/edit', routeAuthenticationGuard, async (request, response, next) => {
  const id = request.params.id;
  const userId = request.session.userId;

  try {
    const post = await Post.findById(id).populate('creator');
    if (post) {
      response.render('post/single', { post: post });
      response.render('post/edit', { post });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

postRouter.post('/:id/edit', routeAuthenticationGuard, (request, response, next) => {
  const id = request.params.id;
  const { content } = request.body;
  const userId = request.session.userId;

  Post.findOneAndUpdate({ _id: id, creator: userId }, { content })
    .then(() => {
      response.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

module.exports = postRouter;
