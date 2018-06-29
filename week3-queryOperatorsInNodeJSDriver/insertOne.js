require('dotenv').config();

const assert = require('assert');
const { MongoClient } = require('mongodb');
const Twitter = require('twitter');

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  assert.equal(err, null);
  console.log('Successfully connected to mongodb');

    twitterClient.stream('statuses/filter', { track: 'matrix' }, stream => {
      stream.on('data', status => {
        console.log(status.text);

        client.db('social').collection('statuses').insertOne(status, (err, result) => {
          console.log('Inserted a new document with id: ' + result.insertedId);
        });
      });

      stream.on('error', error => { throw error; });
    });
});
