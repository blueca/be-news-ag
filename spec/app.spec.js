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
  describe('/api/users/:username', () => {
    it('GET:200 returns an object of a particular user', () => {
      return request(app)
        .get('/api/users/rogersop')
        .expect(200)
        .then(res => {
          expect(res.body.user).to.eql({
            username: 'rogersop',
            name: 'paul',
            avatar_url:
              'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
          });
        });
    });
    it('GET:404 returns an error message for username not found', () => {
      return request(app)
        .get('/api/users/not-a-username')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('username not found');
        });
    });
  });
});
