const { incrementCommentVotes } = require('../3-models/comments.model');

exports.updateComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  incrementCommentVotes(comment_id, inc_votes).then(comment => {
    res.status(200).send({ comment });
  });
};
