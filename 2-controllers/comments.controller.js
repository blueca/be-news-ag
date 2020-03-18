const { incrementCommentVotes } = require('../3-models/comments.model');

exports.updateComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req;
  incrementCommentVotes(comment_id, body)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
