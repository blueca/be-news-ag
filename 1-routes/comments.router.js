const commentsRouter = require('express').Router();
const {
  updateComment,
  removeComment
} = require('../2-controllers/comments.controller');
const { method405 } = require('../4-errors/server-errors');

commentsRouter
  .route('/:comment_id')
  .patch(updateComment)
  .delete(removeComment)
  .all(method405);

module.exports = commentsRouter;
