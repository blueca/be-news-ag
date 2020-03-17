const {
  fetchArticle,
  incrementArticleVotes
} = require('../3-models/articles.model');

exports.sendArticle = (req, res, next) => {
  fetchArticle(req.params.article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticle = (req, res, next) => {
  let promise;
  if (req.body.inc_votes === undefined) {
    promise = Promise.reject('noKey');
  } else if (Object.keys(req.body).length > 1) {
    promise = Promise.reject('extraKey');
  } else {
    promise = incrementArticleVotes(
      req.params.article_id,
      req.body.inc_votes
    ).then(updatedArticle => {
      res.status(200).send({ updatedArticle });
    });
  }
  promise.catch(next);
};
