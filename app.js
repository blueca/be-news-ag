const express = require('express');
const app = express();
const apiRouter = require('./1-routes/api.router');
const { serverErrors } = require('./4-errors/server-errors');

app.use(express.json());

app.use('/api', apiRouter);

app.route('/*').all((req, res, next) => {
  res.status(404).send({ error: 'page not found' });
});

module.exports = app;
