const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('when passed an array of objects, returns a new array with copies of the object', () => {
    const input = [{ a: 2 }];
    const actual = formatDates(input);
    const expected = [{ a: 2 }];
    expect(actual).to.eql(expected);
    expect(actual).to.not.equal(input);
    expect(actual[0]).to.not.equal(input[0]);
  });
  it('when passed an array with a single object, a new array is returned containing a copy of the object with an updated date property', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const actual = formatDates(input);
    const expected = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: new Date(1542284514171).toString(),
        votes: 100
      }
    ];
    expect(actual).to.eql(expected);
  });
  it('does not mutate original input', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    formatDates(input);
    const control = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    expect(input).to.eql(control);
  });
  it('works when passed multiple objects in an array', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      },
      {
        title: 'Eight pug gifs that remind me of mitch',
        topic: 'mitch',
        author: 'icellusedkars',
        body: 'some gifs',
        created_at: 1289996514171
      }
    ];
    const actual = formatDates(input);
    const expected = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: new Date(1542284514171).toString(),
        votes: 100
      },
      {
        title: 'Eight pug gifs that remind me of mitch',
        topic: 'mitch',
        author: 'icellusedkars',
        body: 'some gifs',
        created_at: new Date(1289996514171).toString()
      }
    ];
    expect(actual[0]).to.eql(expected[0]);
    expect(actual[1]).to.eql(expected[1]);
  });
});

describe('makeRefObj', () => {
  it('when passed an array of objects with title/article_id keys, returns an object with a key of the title value, and a value of the article_id value', () => {
    const input = [{ article_id: 1, title: 'A' }];
    const actual = makeRefObj(input);
    const expected = { A: 1 };
    expect(actual).to.eql(expected);
  });
  it('when passed multiple objects in an array, returned reference object will contain all the relevant data', () => {
    const input = [
      { article_id: 1, title: 'A' },
      { article_id: 3, title: 'TEST' }
    ];
    const actual = makeRefObj(input);
    const expected = { A: 1, TEST: 3 };
    expect(actual).to.eql(expected);
  });
});

describe('formatComments', () => {
  it('when passed an array containing an object, returns a new array containing a copy of the object', () => {
    const comments = [
      {
        body: 'This is a test comment',
        belongs_to: 'Article A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const ref = { 'Article A': 2 };
    const actual = formatComments(comments, ref);
    const expected = [
      {
        body: 'This is a test comment',
        article_id: 2,
        author: 'butter_bridge',
        votes: 16,
        created_at: new Date(1511354163389).toString()
      }
    ];
    expect(actual[0]).to.eql(expected[0]);
  });
  it('does not mutate the original comments', () => {
    const comments = [
      {
        body: 'This is a test comment',
        belongs_to: 'Article A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const ref = { 'Article A': 2 };
    formatComments(comments, ref);
    const control = [
      {
        body: 'This is a test comment',
        belongs_to: 'Article A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ];
    expect(comments).to.eql(control);
    expect(comments[0]).to.eql(control[0]);
  });
  it('works for an array of multiple objects', () => {
    const comments = [
      {
        body: 'This is a test comment',
        belongs_to: 'Article A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      },
      {
        body: 'Another test!',
        belongs_to: 'Article Q',
        created_by: 'abc123',
        votes: 166,
        created_at: 1542284514171
      }
    ];
    const ref = { 'Article A': 2, 'Article Q': 5 };
    const actual = formatComments(comments, ref);
    const expected = [
      {
        body: 'This is a test comment',
        article_id: 2,
        author: 'butter_bridge',
        votes: 16,
        created_at: new Date(1511354163389).toString()
      },
      {
        body: 'Another test!',
        article_id: 'Article Q',
        author: 'abc123',
        votes: 166,
        created_at: new Date(1542284514171).toString()
      }
    ];
    expect(actual[0]).to.eql(expected[0]);
  });
});
