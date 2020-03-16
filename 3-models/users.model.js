const knex = require('../db/connection');

exports.fetchUser = username => {
  return knex('users')
    .select()
    .where({ username })
    .then(user => {
      return user.length > 0 ? user[0] : Promise.reject('noUser');
    });
};
