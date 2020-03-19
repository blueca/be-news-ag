const apiRouter = require('express').Router();
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');
const articlesRouter = require('./articles.router');
const commentsRouter = require('./comments.router');
const { sendEndpoints } = require('../2-controllers/api.controller');
const { method405 } = require('../4-errors/server-errors');

apiRouter
  .route('/')
  .get(sendEndpoints)
  .all(method405);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
