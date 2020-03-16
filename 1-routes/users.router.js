const usersRouter = require('express').Router();
const { sendUser } = require('../2-controllers/users.controller');

usersRouter.get('/:username', sendUser);

module.exports = usersRouter;
