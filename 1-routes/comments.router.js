const commentsRouter = require('express').Router();
const {
  updateComment,
  removeComment
} = require('../2-controllers/comments.controller');

commentsRouter
  .route('/:comment_id')
  .patch(updateComment)
  .delete(removeComment);

module.exports = commentsRouter;
