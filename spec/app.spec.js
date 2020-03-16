process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiSorted = require('chai-sorted');
const { expect } = chai;
const request = require('supertest');
const app = require('../app');
const knex = require('../db/connection');

chai.use(chaiSorted);

describe('server', () => {
  beforeEach(() => {
    return knex.seed.run();
  });
  after(() => {
    knex.destroy();
  });
  describe('/not-a-route', () => {
    it('GET:404 returns an error message for route not found', () => {
      return request(app)
        .get('/not-a-route')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('page not found');
        });
    });
  });
  describe('/api/topics', () => {
    it('GET:200 returns an object containing an array of all topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(res => {
          expect(res.body.topics).to.be.an('array');
        });
    });
  });
});
