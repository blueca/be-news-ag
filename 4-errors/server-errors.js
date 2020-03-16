const fs = require('fs').promises;

exports.serverErrors = (err, req, res, next) => {
  const errors = {};
  console.log('in the error');

  if (err in errors) {
    res.status(errors[err].status).send({ msg: errors[err].msg });
  } else {
    fs.appendFile('./4-errors/error-log.txt', `${new Date()}:\n${err}\n\n`);
    res.status(500).send({ 'internal error': 'this error has been logged' });
  }
};
