const knex = require('../db/connection');

exports.fetchUser = username => {
  return knex('users')
    .select()
    .where({ username })
    .then(user => {
      return user[0];
    });
};
