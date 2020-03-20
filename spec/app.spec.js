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
  it('ERROR:GET:404 returns an error message for route not found', () => {
    return request(app)
      .get('/api/not-a-route')
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
  describe('/articles', () => {
    it('GET:200 returns an object containing an array of all articles, by default sorted by date in desc order', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(res => {
          expect(res.body.articles[0]).to.have.all.keys([
            'author',
            'title',
            'article_id',
            'topic',
            'created_at',
            'votes',
            'comment_count'
          ]);
          expect(res.body.articles).to.be.descendingBy('created_at');
        });
    });
    it('GET:200 accepts sort_by query', () => {
      return request(app)
        .get('/api/articles?sort_by=comment_count')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.be.descendingBy('comment_count');
        });
    });
    it('GET:200 accepts order query', () => {
      return request(app)
        .get('/api/articles?order=asc')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.be.ascendingBy('created_at');
        });
    });
    it('GET:200 returns correctly when passed both sory_by and order queries', () => {
      return request(app)
        .get('/api/articles?order=asc&sort_by=comment_count')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.be.ascendingBy('comment_count');
        });
    });
    it('ERROR:GET:400 returns error message when sort_by query is given a nonexistent column', () => {
      return request(app)
        .get('/api/articles?sort_by=not_a_column')
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('invalid data in query');
        });
    });
    it('ERROR:GET:400 when passed an order query other than asc/desc, sends error message', () => {
      return request(app)
        .get('/api/articles?order=bad')
        .expect(400)
        .then(res => {
          expect(res.body.error).to.equal('invalid sort order');
        });
    });
    it('GET:200 returns a filtered list of articles when passed an author query', () => {
      return request(app)
        .get('/api/articles?author=icellusedkars')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(6);
          res.body.articles.forEach(article => {
            expect(article.author).to.equal('icellusedkars');
          });
        });
    });
    it('GET:200 returns a filtered list of articles when passed a topic query', () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(10);
          expect(res.body.articles[4].topic).to.equal('mitch');
        });
    });
    it('ERROR:GET:400 returns error when filtering by an author who is not in the database', () => {
      return request(app)
        .get('/api/articles?author=notInDatabase')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('author does not exist');
        });
    });
    it('ERROR:GET:400 returns error when filtering by a topic which is not in the database', () => {
      return request(app)
        .get('/api/articles?topic=notInDatabase')
        .expect(404)
        .then(res => {
          expect(res.body.error).to.equal('topic does not exist');
        });
    });
    it('GET:200 returns an empty array when a valid topic has no articles', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.eql([]);
        });
    });
    it('GET:200 returns an empty array when a valid author has no articles', () => {
      return request(app)
        .get('/api/articles?author=lurker')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.eql([]);
        });
    });
    it('GET:200 accepts a limit query, which defaults to 10', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(10);
        });
    });
    it('GET:200 returns x results depending on limit query', () => {
      return request(app)
        .get('/api/articles?limit=8')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(8);
        });
    });
    it('GET:200 returns default limited results when an invalid limit is entered (NaN or < 1)', () => {
      const notNumber = request(app)
        .get('/api/articles?limit=not-valid')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(10);
        });
      const lessThanOne = request(app)
        .get('/api/articles?limit=0')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.have.lengthOf(10);
        });
      return Promise.all([notNumber, lessThanOne]);
    });
    it('GET:200 accepts a page number query ("p") which defaults to 1', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(res => {
          expect(res.body.articles[0].title).to.equal(
            'Living in the shadow of a great man'
          );
        });
    });
    it('GET:200 results change based on page number', () => {
      return request(app)
        .get('/api/articles?p=2')
        .expect(200)
        .then(res => {
          expect(res.body.articles[0].title).to.equal('Am I a cat?');
          expect(res.body.articles).to.have.lengthOf(2);
        });
    });
    it('GET:200 returns default page when invalid page number is entered (NaN or < 1)', () => {
      const notNumber = request(app)
        .get('/api/articles?p=not-valid')
        .expect(200)
        .then(res => {
          expect(res.body.articles[0].title).to.equal(
            'Living in the shadow of a great man'
          );
          expect(res.body.articles).to.have.lengthOf(10);
        });
      const lessThanOne = request(app)
        .get('/api/articles?p=0')
        .expect(200)
        .then(res => {
          expect(res.body.articles[0].title).to.equal(
            'Living in the shadow of a great man'
          );
          expect(res.body.articles).to.have.lengthOf(10);
        });
      return Promise.all([notNumber, lessThanOne]);
    });
    it('ERROR:405 for invalid methods', () => {
      const invalidMethods = ['patch', 'delete', 'put', 'post'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/articles')
          .expect(405)
          .then(res => {
            expect(res.body.error).to.equal('invalid method');
          });
      });
      return Promise.all(methodPromises);
    });
    describe('/:article_id', () => {
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
            expect(res.body.error).to.equal(
              'request is missing a required key'
            );
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
              expect(res.body.error).to.equal(
                'request has too many properties'
              );
            });
        });
        it('ERROR:POST:400 returns an error message when body includes a username which is not in the usernames table', () => {
          return request(app)
            .post('/api/articles/9/comments')
            .send({
              username: 'notintable',
              body: 'this is the comment'
            })
            .expect(400)
            .then(res => {
              expect(res.body.error).to.equal('username not found');
            });
        });
        it("ERROR:POST:404 returns an error message when the specified article is valid but doesn't exist", () => {
          return request(app)
            .post('/api/articles/0/comments')
            .expect(404)
            .then(res => {
              expect(res.body.error).to.equal('article not found');
            });
        });
        it('ERROR:POST:400 returns an error message when the specified article is not a valid id', () => {
          return request(app)
            .post('/api/articles/not-valid/comments')
            .expect(400)
            .then(res => {
              expect(res.body.error).to.equal('bad request');
            });
        });
        it('GET:200 returns an array of comments for a particular article_id, by default sorted by created_at, desc', () => {
          return request(app)
            .get('/api/articles/9/comments')
            .expect(200)
            .then(res => {
              expect(res.body.comments[0]).to.have.all.keys([
                'comment_id',
                'author',
                'votes',
                'created_at',
                'body'
              ]);
              expect(res.body.comments[0].author).to.equal('butter_bridge');
              expect(res.body.comments.length).to.equal(2);
              expect(res.body.comments).to.be.descendingBy('created_at');
            });
        });
        it('GET:200 returns an array of comments for an article_id, sorted by the specified query', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=votes')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.descendingBy('votes');
            });
        });
        it('GET:200 returns an array of comments for an article_id, with sort order specified by the query', () => {
          return request(app)
            .get('/api/articles/1/comments?order=asc')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.ascendingBy('created_at');
            });
        });
        it('GET:200 returns an array of comments sorted correctly when passed a sort_by and order query', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=votes&order=asc')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.ascendingBy('votes');
            });
        });
        it('GET:200 returns an empty array when an article has no comments', () => {
          return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.have.lengthOf(0);
            });
        });
        it('ERROR:GET:400 returns an error message for an article with an invalid id', () => {
          return request(app)
            .get('/api/articles/not-valid/comments')
            .expect(400)
            .then(res => {
              expect(res.body.error).to.equal('bad request');
            });
        });
        it("ERROR:GET:404 returns an error message for an article which doesn't exist", () => {
          return request(app)
            .get('/api/articles/0/comments')
            .expect(404)
            .then(res => {
              expect(res.body.error).to.equal('article not found');
            });
        });
        it('ERROR:GET:400 returns error message when sort_by query is given a nonexistent column', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=not_a_column')
            .expect(400)
            .then(res => {
              expect(res.body.error).to.equal('invalid data in query');
            });
        });
        it('ERROR:GET:400 when passed an order query other than asc/desc, sends error message', () => {
          return request(app)
            .get('/api/articles/1/comments?order=bad')
            .expect(400)
            .then(res => {
              expect(res.body.error).to.equal('invalid sort order');
            });
        });
        it('GET:200 accepts a limit query, which defaults to 10', () => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.have.lengthOf(10);
            });
        });
        it('GET:200 returns x results depending on limit query', () => {
          return request(app)
            .get('/api/articles/1/comments?limit=8')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.have.lengthOf(8);
            });
        });
        it('GET:200 returns default limited results when an invalid limit is entered (NaN or < 1)', () => {
          const notNumber = request(app)
            .get('/api/articles/1/comments?limit=not-valid')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.have.lengthOf(10);
            });
          const lessThanOne = request(app)
            .get('/api/articles/1/comments?limit=0')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.have.lengthOf(10);
            });
          return Promise.all([notNumber, lessThanOne]);
        });
        it('GET:200 accepts a page number query ("p") which defaults to 1', () => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(res => {
              expect(res.body.comments[0].author).to.equal('butter_bridge');
            });
        });
        it('GET:200 results change based on page number', () => {
          return request(app)
            .get('/api/articles/1/comments?p=2')
            .expect(200)
            .then(res => {
              expect(res.body.comments[0].author).to.equal('icellusedkars');
              expect(res.body.comments).to.have.lengthOf(3);
            });
        });
        it('GET:200 returns default page when invalid page number is entered (NaN or < 1)', () => {
          const notNumber = request(app)
            .get('/api/articles/1/comments?p=not-valid')
            .expect(200)
            .then(res => {
              expect(res.body.comments[0].author).to.equal('butter_bridge');
              expect(res.body.comments).to.have.lengthOf(10);
            });
          const lessThanOne = request(app)
            .get('/api/articles/1/comments?p=0')
            .expect(200)
            .then(res => {
              expect(res.body.comments[0].author).to.equal('butter_bridge');
              expect(res.body.comments).to.have.lengthOf(10);
            });
          return Promise.all([notNumber, lessThanOne]);
        });
        it('ERROR:405 for invalid methods', () => {
          const invalidMethods = ['patch', 'delete', 'put'];
          const methodPromises = invalidMethods.map(method => {
            return request(app)
              [method]('/api/articles/3/comments')
              .expect(405)
              .then(res => {
                expect(res.body.error).to.equal('invalid method');
              });
          });
          return Promise.all(methodPromises);
        });
      });
    });
  });
  describe('/comments', () => {
    describe('/:comment_id', () => {
      it('PATCH:200 updates the comment based on the request body, returns the updated comment', () => {
        return request(app)
          .patch('/api/comments/15')
          .send({ inc_votes: 5 })
          .expect(200)
          .then(res => {
            expect(res.body.comment).to.eql({
              comment_id: 15,
              body: "I am 100% sure that we're not completely sure.",
              article_id: 5,
              author: 'butter_bridge',
              votes: 6,
              created_at: new Date(1069850163389).toISOString()
            });
          });
      });
      it("ERROR:PATCH:400 returns an error message when sent body doesn't have an inc_votes key", () => {
        return request(app)
          .patch('/api/comments/15')
          .send({})
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal(
              'request is missing a required key'
            );
          });
      });
      it('ERROR:PATCH:400 returns an error message when body property is an invlaid format', () => {
        return request(app)
          .patch('/api/comments/15')
          .send({ inc_votes: 'not-valid' })
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal('bad request');
          });
      });
      it('ERROR:PATCH:400 returns an error message when body includes additional properties', () => {
        return request(app)
          .patch('/api/comments/15')
          .send({ inc_votes: 4, name: 'Nick' })
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal('request has too many properties');
          });
      });
      it('ERROR:PATCH:404 returns an error message when url contains a comment id which has no comment', () => {
        return request(app)
          .patch('/api/comments/0')
          .send({ inc_votes: 4 })
          .expect(404)
          .then(res => {
            expect(res.body.error).to.equal('comment not found');
          });
      });
      it('ERROR:PATCH:400 returns an error message when url contains an invalid comment_id', () => {
        return request(app)
          .patch('/api/comments/not-valid')
          .send({ inc_votes: 4 })
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal('bad request');
          });
      });
      it('DELETE:204 deletes a specific comment from the database', () => {
        return request(app)
          .delete('/api/comments/15')
          .expect(204);
      });
      it('ERROR:DELETE:400 returns an error message when specified comment_id is invalid', () => {
        return request(app)
          .delete('/api/comments/not-valid')
          .expect(400)
          .then(res => {
            expect(res.body.error).to.equal('bad request');
          });
      });
      it('ERROR:DELETE:404 returns an error message when a specified comment_id does not exist', () => {
        return request(app)
          .delete('/api/comments/0')
          .expect(404)
          .then(res => {
            expect(res.body.error).to.equal('comment not found');
          });
      });
      it('ERROR:405 for invalid methods', () => {
        const invalidMethods = ['get', 'post', 'put'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/comments/3')
            .expect(405)
            .then(res => {
              expect(res.body.error).to.equal('invalid method');
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
});
