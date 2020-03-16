const { fetchTopics } = require('../3-models/topics.model');

exports.sendTopics = (req, res, next) => {
  fetchTopics().then(topics => {
    res.status(200).send({ topics });
  });
};
