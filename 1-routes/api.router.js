const apiRouter = require('express').Router();
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');
const articlesRouter = require('./articles.router');

apiRouter.get('/', (req, res, next) => {
  res.status(200).send({
    msg: 'placeholder'
  });
});

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);

// apiRouter.route('/*').all((err, req, res, next) => {
//   res.status(404).send({ error: 'page not found' });
// });

module.exports = apiRouter;
