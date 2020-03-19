exports.endpoints = {
  '/api': {
    '/topics': { methods: ['GET'] },
    '/users': { '/:username': { methods: ['GET'] } },
    '/articles': {
      methods: ['GET'],
      '/:article_id': {
        methods: ['GET', 'PATCH'],
        '/comments': { methods: ['GET', 'POST'] }
      }
    },
    '/comments': { '/:comment_id': { methods: ['PATCH', 'DELETE'] } }
  }
};
