const {
  incrementCommentVotes,
  delComment
} = require('../3-models/comments.model');

exports.updateComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req;
  incrementCommentVotes(comment_id, body)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.removeComment = (req, res, next) => {
  const { comment_id } = req.params;
  delComment(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
