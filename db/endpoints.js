exports.endpointsOld = {
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

exports.endpoints = {
  'GET /api': {
    description:
      'serves a json representation of all the available endpoints of the api'
  },
  'GET /api/topics': {
    description: 'serves an array of all topics',
    queries: null,
    exampleResponse: {
      topics: [{ slug: 'coding', description: 'Code is love, code is life' }]
    }
  }
};
