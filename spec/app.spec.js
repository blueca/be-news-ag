process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiSorted = require('chai-sorted');
const { expect } = chai;
const request = require('supertest');
const app = require('../app');
const knex = require('../db/connection');

chai.use(chaiSorted);

describe('/api', () => {
  beforeEach(() => knex.seed.run());
  after(() => knex.destroy());
  it('ERROR:GET:404 returns an error message for route not found', () => {
    return request(app)
      .get('/not-a-route')
      .expect(404)
      .then(res => {
        expect(res.body.error).to.equal('page not found');
      });
  });
  describe('/topics', () => {
    it('GET:200 returns an object containing an array of all topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(res => {
          expect(res.body.topics).to.be.an('array');
        });
    });
    it('ERROR:405 for invalid methods', () => {
      const invalidMethods = ['patch', 'post', 'delete', 'put'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/topics')
          .expect(405)
          .then(res => {
            expect(res.body.error).to.equal('invalid method');
          });
      });
      return Promise.all(methodPromises);
    });
  });
  describe('/users/:username', () => {
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
    it('ERROR:GET:404 returns an error message for username not found', () => {
      return request(app)
        .get('/api/users/not-a-username')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('username not found');
        });
    });
    it('ERROR:405 for invalid methods', () => {
      const invalidMethods = ['patch', 'post', 'delete', 'put'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/users/rogersop')
          .expect(405)
          .then(res => {
            expect(res.body.error).to.equal('invalid method');
          });
      });
      return Promise.all(methodPromises);
    });
  });
  describe('/articles/:article_id', () => {
    it('GET:200 returns an article object as specified by the article_id', () => {
      return request(app)
        .get('/api/articles/9')
        .expect(200)
        .then(res => {
          expect(res.body.article).to.eql({
            article_id: 9,
            title: "They're not exactly dogs, are they?",
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'Well? Think about it.',
            created_at: new Date(533132514171).toISOString(),
            votes: 0,
            comment_count: 2
          });
        });
    });
    it("ERROR:GET:404 returns an error message for an article which doesn't exist", () => {
      return request(app)
        .get('/api/articles/0')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('article not found');
        });
    });
    it('ERROR:GET:400 returns an error message for an invalid article_id', () => {
      return request(app)
        .get('/api/articles/not-valid')
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('bad request');
        });
    });
    it('PATCH:200 updates the article based on request body, returns updated article', () => {
      return request(app)
        .patch('/api/articles/9')
        .send({ inc_votes: 4 })
        .expect(200)
        .then(res => {
          expect(res.body.article).to.eql({
            article_id: 9,
            title: "They're not exactly dogs, are they?",
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'Well? Think about it.',
            created_at: new Date(533132514171).toISOString(),
            votes: 4,
            comment_count: 2
          });
        });
    });
    it("ERROR:PATCH:400 returns an error message when sent body doesn't have an inc_votes key", () => {
      return request(app)
        .patch('/api/articles/9')
        .send({})
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('request is missing a required key');
        });
    });
    it('ERROR:PATCH:400 returns an error message when body property is an invalid format', () => {
      return request(app)
        .patch('/api/articles/9')
        .send({ inc_votes: 'not-valid' })
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('bad request');
        });
    });
    it('ERROR:PATCH:400 returns an error message when body includes additional properties', () => {
      return request(app)
        .patch('/api/articles/9')
        .send({ inc_votes: 4, name: 'Nick' })
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('request has too many properties');
        });
    });
    it('ERROR:405 for invalid methods', () => {
      const invalidMethods = ['post', 'delete', 'put'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/articles/2')
          .expect(405)
          .then(res => {
            expect(res.body.error).to.equal('invalid method');
          });
      });
      return Promise.all(methodPromises);
    });
    describe('/comments', () => {
      it('POST:201 adds a comment and returns the new comment', () => {
        return request(app)
          .post('/api/articles/9/comments')
          .send({ username: 'lurker', body: 'adding a new comment' })
          .expect(201)
          .then(res => {
            expect(res.body.comment).to.have.all.keys([
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            ]);
            expect(res.body.comment.comment_id).to.equal(19);
            expect(res.body.comment.author).to.equal('lurker');
            expect(res.body.comment.article_id).to.equal(9);
            expect(res.body.comment.body).to.equal('adding a new comment');
          });
      });
      it('ERROR:POST:400 returns an error message when sent body is missing a required property', () => {
        return request(app)
          .post('/api/articles/9/comments')
          .send({
            body: "this comment object doesn't have a username property"
          })
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal(
              'request is missing a required key'
            );
          });
      });
      it('ERROR:POST:400 returns an error message when body includes additional parameters', () => {
        return request(app)
          .post('/api/articles/9/comments')
          .send({
            username: 'lurker',
            body: 'this is the comment',
            article_id: 4
          })
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal('request has too many properties');
          });
      });
    });
  });
});
