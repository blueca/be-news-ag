const articlesRouter = require('express').Router();
const {
  sendArticle,
  updateArticle,
  postComment,
  sendComments,
  sendArticles
} = require('../2-controllers/articles.controller');
const { method405 } = require('../4-errors/server-errors');

articlesRouter
  .route('/')
  .get(sendArticles)
  .all(method405);

articlesRouter
  .route('/:article_id')
  .get(sendArticle)
  .patch(updateArticle)
  .all(method405);

articlesRouter
  .route('/:article_id/comments')
  .post(postComment)
  .get(sendComments)
  .all(method405);

module.exports = articlesRouter;
