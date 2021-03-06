const knex = require('../db/connection');
const { checkExists, getCount } = require('../db/utils/utils');

exports.fetchArticle = article_id => {
  return knex
    .select('articles.*')
    .from('articles')
    .count({ comment_count: 'comment_id' })
    .where({ 'articles.article_id': article_id })
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .then(article => {
      if (article.length) {
        article[0].comment_count = parseInt(article[0].comment_count);

        return article[0];
      } else {
        return Promise.reject('noArticle');
      }
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
  let { sort_by = 'created_at', order = 'desc', limit, p } = query;

  limit = Number.isNaN(parseInt(limit)) || limit < 1 ? '10' : limit;
  p = Number.isNaN(parseInt(p)) || p < 1 ? '1' : p;

  if (order !== 'desc' && order !== 'asc') {
    return Promise.reject('badOrder');
  }

  const commentCount = getCount('comments', 'comment_id', {
    article_id
  });

  const comments = checkExists('articles', 'article_id', article_id).then(
    article => {
      if (!article) {
        return Promise.reject('noArticle');
      } else {
        return knex('comments')
          .select('comment_id', 'author', 'votes', 'created_at', 'body')
          .where({ article_id })
          .orderBy(sort_by, order)
          .limit(limit)
          .offset((p - 1) * limit);
      }
    }
  );

  return Promise.all([comments, commentCount]);
};

exports.fetchArticles = queries => {
  let {
    sort_by = 'created_at',
    order = 'desc',
    limit,
    p,
    author,
    topic
  } = queries;

  limit = Number.isNaN(parseInt(limit)) || limit < 1 ? '10' : limit;
  p = Number.isNaN(parseInt(p)) || p < 1 ? '1' : p;

  if (order !== 'desc' && order !== 'asc') {
    return Promise.reject('badOrder');
  }
  const userExistsPromise = author
    ? checkExists('users', 'username', author)
    : true;
  const topicExistsPromise = topic
    ? checkExists('topics', 'slug', topic)
    : true;

  const articlesCount = getCount('articles', 'article_id', { author, topic });

  const articles = Promise.all([userExistsPromise, topicExistsPromise]).then(
    ([usersExist, topicsExist]) => {
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
        .limit(limit)
        .offset((p - 1) * limit)
        .then(articles => {
          articles.forEach(article => {
            article.comment_count = parseInt(article.comment_count);
          });
          return articles;
        });
    }
  );

  return Promise.all([articles, articlesCount]);
};
