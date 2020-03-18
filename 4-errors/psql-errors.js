exports.psqlErrors = (err, req, res, next) => {
  const { code } = err;

  const errors = {
    '22P02': { status: 400, msg: 'bad request' },
    '23502': { status: 400, msg: 'request is missing a required key' },
    // template literal for "x not found" based on 'constraint' key of err?
    '23503': { status: 400, msg: 'username not found' },
    '42703': { status: 400, msg: 'invalid data in query' }
  };

  if (code in errors) {
    res.status(errors[code].status).send({ error: errors[code].msg });
  } else {
    next(err);
  }
};
