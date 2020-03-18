const knex = require('../db/connection');

exports.incrementCommentVotes = (comment_id, body) => {
  if (body.inc_votes === undefined) {
    return Promise.reject('noKey');
  } else if (Object.keys(body).length > 1) {
    return Promise.reject('extraKey');
  } else {
    return knex('comments')
      .where({ comment_id })
      .increment({ votes: body.inc_votes })
      .returning('*')
      .then(comment => {
        return comment.length > 0 ? comment[0] : Promise.reject('noComment');
      });
  }
};

exports.delComment = comment_id => {
  return knex('comments')
    .where({ comment_id })
    .then(comments => {
      if (comments.length > 0) {
        return knex('comments')
          .where({ comment_id })
          .del();
      } else {
        return Promise.reject('noComment');
      }
    });
};
