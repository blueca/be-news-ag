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
  return knex('articles')
    .where({ article_id })
    .increment({ votes })
    .then(() => {
      return this.fetchArticle(article_id);
    });
};
