const { MongoClient } = require('mongodb');
const assert = require('assert');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  assert.equal(err, null);
  console.log('successfully connected to mongodb');

  const collection = client.db('crunchbase').collection('companies');
  const cursor = collection.find({ permalink: {$exists:true, $ne:null} });

  cursor.project({ permalink: 1, updated_at: 1 });
  cursor.sort({ permalink: 1 });

  let duplicatesCount = 0;
  let previousDocument = {};

  cursor.forEach(
  doc => {
    if (doc.permalink === previousDocument.permalink && doc.updated_at === previousDocument.updated_at) {
      console.log('Current doc:');
      console.log(doc);
      console.log('\n');
      console.log('Duplicate doc:');
      console.log(previousDocument);
      console.log('--------------------------------------------------------------------------------');

      duplicatesCount++;

      // collection.deleteOne({ _id: doc._id }, (err, res) => {
      //   assert.equal(err, null);
      //
      //   console.log(res.result);
      //   process.exit();
      // });
    }

    previousDocument = doc;
  },
  err => {
    assert.equal(err, null);

    console.log('Duplicates found:' + duplicatesCount);

    client.close();
 });
});
