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
  incrementArticleVotes(req.params.article_id, req.body.inc_votes)
    .then(updatedArticle => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};
