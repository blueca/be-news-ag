const knex = require('../db/connection');

exports.incrementCommentVotes = (comment_id, votes) => {
  return knex('comments')
    .where({ comment_id })
    .increment({ votes })
    .returning('*')
    .then(comment => {
      return comment[0];
    });
};
