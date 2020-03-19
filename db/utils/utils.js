const knex = require('../connection');

exports.formatDates = list => {
  const nArr = list.map(obj => {
    const nObj = { ...obj };
    if (nObj.created_at !== undefined) {
      const nDate = new Date(nObj.created_at).toISOString();
      nObj.created_at = nDate;
    }
    return nObj;
  });
  return nArr;
};

exports.makeRefObj = list => {
  const refObj = {};
  list.forEach(obj => {
    refObj[obj.title] = obj.article_id;
  });

  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  const nArr = comments.map(comment => {
    const nComment = { ...comment };
    nComment.author = nComment.created_by;
    nComment.article_id = articleRef[nComment.belongs_to];

    delete nComment.created_by;
    delete nComment.belongs_to;

    return nComment;
  });

  return this.formatDates(nArr);
};

exports.checkExists = (table, column, query) => {
  return knex(table)
    .select()
    .where({ [column]: query })
    .first();
};
