const { fetchUser } = require('../3-models/users.model');

exports.sendUser = (req, res, next) => {
  fetchUser(req.params.username)
    .then(user => {
      res.status(200).send({ user });
    })
    .catch(next);
};
