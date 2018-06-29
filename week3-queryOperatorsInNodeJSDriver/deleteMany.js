const { MongoClient } = require('mongodb');
const assert = require('assert');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  assert.equal(err, null);
  console.log('successfully connected to mongodb');

  const collection = client.db('crunchbase').collection('companies');
  const cursor = collection.find({ permalink: {$exists:true, $ne:null} });

  cursor.project({ permalink: 1, updated_at: 1 });
  cursor.sort({ permalink: 1 });

  let previousDocument = {};
  const markedForRemoval = [];

  cursor.forEach(
  doc => {
    if (doc.permalink === previousDocument.permalink && doc.updated_at === previousDocument.updated_at) {
      markedForRemoval.push(doc._id);
    }

    previousDocument = doc;
  },
  err => {
    assert.equal(err, null);
    console.log('Documents marked for removal: ' + markedForRemoval.length);

    const filter = {
      _id: { $in: markedForRemoval }
    };

    collection.deleteMany(filter, (err, res) => {
      assert.equal(err, null);

      console.log(res.result);

      client.close();
    });
 });
});
