const {
  fetchArticle,
  incrementArticleVotes,
  insertComment,
  fetchComments
} = require('../3-models/articles.model');

exports.sendArticle = (req, res, next) => {
  fetchArticle(req.params.article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticle = (req, res, next) => {
  incrementArticleVotes(req.params.article_id, req.body)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  insertComment(req.params.article_id, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.sendComments = (req, res, next) => {
  fetchComments(req.params, req.query).then(comments => {
    res.status(200).send({ comments });
  });
};
