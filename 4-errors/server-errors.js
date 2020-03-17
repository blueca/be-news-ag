const fs = require('fs').promises;

exports.serverErrors = (err, req, res, next) => {
  const errors = {
    noUser: { status: 404, msg: 'username not found' },
    noArticle: { status: 404, msg: 'article not found' },
    noKey: { status: 400, msg: 'request is missing a required key' }
  };

  if (err in errors) {
    res.status(errors[err].status).send({ error: errors[err].msg });
  } else {
    fs.appendFile('./4-errors/error-log.txt', `${new Date()}:\n${err}\n\n`);
    res.status(500).send({ 'internal error': 'this error has been logged' });
  }
};

exports.method405 = (req, res, next) => {
  res.status(405).send({ error: 'invalid method' });
};
