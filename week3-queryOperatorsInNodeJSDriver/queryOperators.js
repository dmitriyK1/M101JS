const { MongoClient } = require('mongodb');
const program = require('commander');
const assert = require('assert');

const options = commandLineOptions();

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  assert.equal(err, null);
  console.log('Successfully connected to mongodb');

  const query = queryDocument(options);

  const projection = {
    _id: 0,
    name: 1,
    founded_year: 1,
    number_of_employees: 1,
    crunchbase_url: 1,
  };

  const db = client.db('crunchbase');
  const collection = db.collection('companies');

  const cursor = collection.find(query, { projection });

  var count = 0;

  cursor.forEach(doc => {
    count++;
    console.log(doc);
  }, err => {
    console.log(count, '!!!!!!!!!!!!!!');
    console.log(`Our query was: ${JSON.stringify(query)}`);
    client.close();
  });
});

function commandLineOptions() {
  program
    .option('-f, --firstYear <n>', 'From year', parseInt)
    .option('-l, --lastYear <n>', 'To year', parseInt)
    .option('-e, --employees <n>', 'Employees', parseInt)
    .parse(process.argv);

  if (!('firstYear' in program) && !('lastYear' in program)) {
    console.log('Please provide all arguments');
    process.exit();
  }

  return program;
}

function queryDocument(options) {
  const query = {
    founded_year: {
      $gte: options.firstYear,
      $lte: options.lastYear,
    }
  };

  if ('employees' in options) {
    query.number_of_employees = options.employees;
  }

  return query;
}
