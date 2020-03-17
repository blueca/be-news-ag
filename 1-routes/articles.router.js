const articlesRouter = require('express').Router();
const { sendArticle } = require('../2-controllers/articles.controller');

articlesRouter.get('/:article_id', sendArticle);

module.exports = articlesRouter;
