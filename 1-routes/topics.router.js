const topicsRouter = require('express').Router();
const { sendTopics } = require('../2-controllers/topics.controller');
const { method405 } = require('../4-errors/server-errors');

topicsRouter
  .route('/')
  .get(sendTopics)
  .all(method405);

module.exports = topicsRouter;
