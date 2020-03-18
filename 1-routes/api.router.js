const apiRouter = require('express').Router();
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');
const articlesRouter = require('./articles.router');
const commentsRouter = require('./comments.router');

apiRouter.get('/', (req, res, next) => {
  res.status(200).send({
    msg: 'placeholder'
  });
});

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
