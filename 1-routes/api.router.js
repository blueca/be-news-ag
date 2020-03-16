const apiRouter = require('express').Router();
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');

apiRouter.get('/', (req, res, next) => {
  res.status(200).send({
    msg: 'placeholder'
  });
});

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

apiRouter.route('/*').all((err, req, res, next) => {
  console.log('in the all');
  res.status(404).send({ error: 'page not found' });
});

module.exports = apiRouter;
