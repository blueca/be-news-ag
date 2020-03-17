const { fetchArticle } = require('../3-models/articles.model');

exports.sendArticle = (req, res, next) => {
  fetchArticle(req.params.article_id).then(article => {
    res.status(200).send({ article });
  });
};
