const { endpoints } = require('../db/endpoints');

exports.sendEndpoints = (req, res, next) => {
  res.status(200).send(endpoints);
};
