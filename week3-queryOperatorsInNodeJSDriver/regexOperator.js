const { MongoClient } = require('mongodb');
const assert = require('assert');
const program = require('commander');
const chalk = require('chalk');

const options = commandLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', (err, client) => {
  assert.equal(err, null);
  console.log('Successfully connected to mongodb');

  const query = queryDocument(options);

  const cursor = (
    client
      .db()
      .collection('companies')
      .find(query)
      .project(projectionDocument(options))
  );

  var matchNum = 0;

  cursor.forEach(doc => {
    console.log(doc);

    matchNum++;
  }, err => {
    assert.equal(err, null);

    console.log(chalk.yellow('\nMatches found: ' + matchNum));
    console.log('Our query was: ' + JSON.stringify(query));

    client.close();
  });
});

function queryDocument(options) {
  const query = {};

  if ('overview' in options) {
    query.overview = {
      $regex: options.overview,
      $options: 'i',
    };
  }

  if ('milestones' in options) {
    query['milestones.source_description'] = {
      $regex: options.milestones,
      $options: 'i',
    };
  }

  return query;
}

function projectionDocument(options) {
  const projection = {
    _id: 0,
    name: 1,
    founded_year: 1,
  };

  if ('overview' in options) {
    projection.overview = 1;
  }

  if ('milestones' in options) {
    projection['milestones.source_description'] = 1;
  }

  return projection;
}

function commandLineOptions() {
  program
    .option('-O, --overview [name]', 'Add an overview to search query')
    .option('-M, --milestones [name]', 'Add a milestones to search query')
    .parse(process.argv);

  if (process.argv.length < 4) {
    console.log('Specify at least one argument for search query');

    process.exit(1);
  }

  return program;
}
