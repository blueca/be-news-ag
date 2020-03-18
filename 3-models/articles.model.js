const knex = require('../db/connection');

exports.fetchArticle = article_id => {
  const articleDetails = knex('articles')
    .select()
    .where({ article_id })
    .then(article => {
      return article.length > 0 ? article[0] : Promise.reject('noArticle');
    });
  const commentCount = knex('comments')
    .count()
    .where({ article_id })
    .then(res => {
      return res[0].count;
    });

  return Promise.all([articleDetails, commentCount]).then(
    ([articleDetails, commentCount]) => {
      const article = { ...articleDetails };
      article.comment_count = parseInt(commentCount);
      return article;
    }
  );
};

exports.incrementArticleVotes = (article_id, votes) => {
  if (votes.inc_votes === undefined) {
    return Promise.reject('noKey');
  } else if (Object.keys(votes).length > 1) {
    return Promise.reject('extraKey');
  } else {
    return knex('articles')
      .where({ article_id })
      .increment({ votes: votes.inc_votes })
      .then(() => {
        // didn't use .returning('*') as I assume the updated article which gets returned should have a comment count
        return this.fetchArticle(article_id);
      });
  }
};

exports.insertComment = (article_id, body) => {
  if (Object.keys(body).length > 2) {
    return Promise.reject('extraKey');
  } else {
    const newComment = { ...body };
    newComment.article_id = article_id;
    newComment.author = newComment.username;
    delete newComment.username;

    return knex('comments')
      .insert(newComment)
      .returning('*')
      .then(comment => {
        return comment[0];
      });
  }
};

exports.fetchComments = params => {
  const { article_id } = params;
  return knex('comments')
    .select('comment_id', 'author', 'votes', 'created_at', 'body')
    .where({ article_id })
    .orderBy('created_at', 'desc');
};
