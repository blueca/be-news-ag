const articlesRouter = require('express').Router();
const { sendArticle } = require('../2-controllers/articles.controller');
const { method405 } = require('../4-errors/server-errors');

articlesRouter
  .route('/:article_id')
  .get(sendArticle)
  .all(method405);

module.exports = articlesRouter;
