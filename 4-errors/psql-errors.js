exports.psqlErrors = (err, req, res, next) => {
  const { code } = err;

  const errors = {
    '22P02': { status: 400, msg: 'bad request' },
    '23502': { status: 400, msg: 'request is missing a required key' }
  };

  if (code in errors) {
    res.status(errors[code].status).send({ error: errors[code].msg });
  } else {
    next(err);
  }
};
