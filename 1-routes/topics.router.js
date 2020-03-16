const topicsRouter = require('express').Router();
const { sendTopics } = require('../2-controllers/topics.controller');

topicsRouter.get('/', sendTopics);

module.exports = topicsRouter;
