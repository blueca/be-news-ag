const knex = require('../db/connection');

exports.fetchArticle = article_id => {
  const articleDetails = knex('articles')
    .select()
    .where({ article_id })
    .then(article => {
      return article[0];
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
