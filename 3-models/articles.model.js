const knex = require('../db/connection');
const { checkExists } = require('../db/utils/utils');

exports.fetchArticle = article_id => {
  return knex
    .select('articles.*')
    .from('articles')
    .count({ comment_count: 'comment_id' })
    .where({ 'articles.article_id': article_id })
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .then(article => {
      nArticle = { ...article[0] };
      nArticle.comment_count = parseInt(nArticle.comment_count);

      if (article.length) {
        return [true, nArticle];
      } else {
        return Promise.all([
          checkExists('articles', 'article_id', article_id),
          nArticle
        ]);
      }
    })
    .then(([articleExists, article]) => {
      if (articleExists) return article;
      else return Promise.reject('noArticle');
    });
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
  }

  return checkExists('articles', 'article_id', article_id).then(article => {
    if (!article) return Promise.reject('noArticle');

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
  });
};

exports.fetchComments = (params, query) => {
  const { article_id } = params;
  const { sort_by = 'created_at', order = 'desc' } = query;

  if (order !== 'desc' && order !== 'asc') {
    return Promise.reject('badOrder');
  }

  return checkExists('articles', 'article_id', article_id).then(article => {
    if (!article) {
      return Promise.reject('noArticle');
    } else {
      return knex('comments')
        .select('comment_id', 'author', 'votes', 'created_at', 'body')
        .where({ article_id })
        .orderBy(sort_by, order);
    }
  });
};

exports.fetchArticles = queries => {
  let { sort_by = 'created_at', order = 'desc', author, topic } = queries;

  if (order !== 'desc' && order !== 'asc') {
    return Promise.reject('badOrder');
  }
  const users = author ? checkExists('users', 'username', author) : true;
  const topics = topic ? checkExists('topics', 'slug', topic) : true;

  return Promise.all([users, topics]).then(([usersExist, topicsExist]) => {
    if (!usersExist) return Promise.reject('noAuthor');
    if (!topicsExist) return Promise.reject('noTopic');
    return knex
      .select(
        'articles.author',
        'articles.title',
        'articles.article_id',
        'articles.topic',
        'articles.created_at',
        'articles.votes'
      )
      .from('articles')
      .count({ comment_count: 'comment_id' })
      .leftJoin('comments', 'articles.article_id', 'comments.article_id')
      .groupBy('articles.article_id')
      .modify(qb => {
        if (author !== undefined) {
          qb.where({ 'articles.author': author });
        }
      })
      .modify(qb => {
        if (topic !== undefined) {
          qb.where({ 'articles.topic': topic });
        }
      })
      .orderBy(sort_by, order)
      .then(articles => {
        const nArticles = articles.map(article => {
          nArticle = { ...article };
          nArticle.comment_count = parseInt(nArticle.comment_count);

          return nArticle;
        });
        // return nArticles.length > 0 ? nArticles : Promise.reject('noArticles');
        return nArticles;
      });
  });

  // const users = knex('users')
  //   .select('username')
  //   .then(users => {
  //     if (
  //       author !== undefined &&
  //       users.filter(user => user.username === author).length === 0
  //     ) {
  //       return Promise.reject('noAuthor');
  //     }
  //   });

  // const topics = knex('topics')
  //   .select('slug')
  //   .then(topics => {
  //     if (
  //       topic !== undefined &&
  //       topics.filter(dbtopic => dbtopic.slug === topic).length === 0
  //     ) {
  //       return Promise.reject('noTopic');
  //     }
  //   });

  // return Promise.all([users, topics]).then(() => {
  //   return knex
  //     .select(
  //       'articles.author',
  //       'articles.title',
  //       'articles.article_id',
  //       'articles.topic',
  //       'articles.created_at',
  //       'articles.votes'
  //     )
  //     .from('articles')
  //     .count({ comment_count: 'comment_id' })
  //     .leftJoin('comments', 'articles.article_id', 'comments.article_id')
  //     .groupBy('articles.article_id')
  //     .modify(qb => {
  //       if (author !== undefined) {
  //         qb.where({ 'articles.author': author });
  //       }
  //     })
  //     .modify(qb => {
  //       if (topic !== undefined) {
  //         qb.where({ 'articles.topic': topic });
  //       }
  //     })
  //     .orderBy(sort_by, order)
  //     .then(articles => {
  //       const nArticles = articles.map(article => {
  //         nArticle = { ...article };
  //         nArticle.comment_count = parseInt(nArticle.comment_count);

  //         return nArticle;
  //       });
  //       // return nArticles.length > 0 ? nArticles : Promise.reject('noArticles');
  //       return nArticles;
  //     });
  // });
};
