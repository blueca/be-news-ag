const usersRouter = require('express').Router();
const { sendUser } = require('../2-controllers/users.controller');
const { method405 } = require('../4-errors/server-errors');

usersRouter
  .route('/:username')
  .get(sendUser)
  .all(method405);

module.exports = usersRouter;
