const express = require('express');
const app = express();
const apiRouter = require('./1-routes/api.router');
const { psqlErrors } = require('./4-errors/psql-errors');
const { serverErrors } = require('./4-errors/server-errors');

app.use(express.json());

app.use('/api', apiRouter);

app.route('/*').all((req, res, next) => {
  res.status(404).send({ error: 'page not found' });
});

app.use(psqlErrors);
app.use(serverErrors);

module.exports = app;
