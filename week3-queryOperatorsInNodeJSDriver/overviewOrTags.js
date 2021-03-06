const { MongoClient } = require('mongodb');
const assert = require('assert');

const allOptions = [
    {
        overview: "wiki",
    },
    {
        milestones: "CMO"
    }
];

var numQueriesFinished = 0;
var companiesSeen = {};

for (var i=0; i<allOptions.length; i++) {
    var query = queryDocument(allOptions[i]);
    queryMongoDB(query, i);
}

function queryMongoDB(query, queryNum) {
    MongoClient.connect('mongodb://localhost:27017', function(err, client) {

        assert.equal(err, null);
        console.log("Successfully connected to MongoDB for query: " + queryNum);

        var cursor = client.db('crunchbase').collection('companies').find(query);

        var numMatches = 0;

        cursor.forEach(
            function(doc) {
                numMatches = numMatches + 1;
                if (doc.permalink in companiesSeen) return;
                companiesSeen[doc.permalink] = doc;
            },
            function(err) {
                assert.equal(err, null);
                console.log("Query " + queryNum + " was:" + JSON.stringify(query));
                console.log("Matching documents: " + numMatches);
                numQueriesFinished = numQueriesFinished + 1;

                if (numQueriesFinished == allOptions.length) {
                    report();
                }

                return client.close();
            }
        );
    });
}

function queryDocument(options) {
    var query = {};

    if ("overview" in options) {
      const condition = { $regex: options.overview, $options: 'i' };

      query['$or'] = [
          { overview: condition },
          { tag_list: condition },
        ];
    }

    if ("milestones" in options) {
        query["milestones.source_description"] = { $regex: options.milestones, $options: 'i' };
    }

    return query;
}


function report(options) {
    var totalEmployees = 0;

    for (key in companiesSeen) {
        totalEmployees = totalEmployees + companiesSeen[key].number_of_employees;
    }

    var companiesList = Object.keys(companiesSeen).sort();
    console.log("Companies found: " + companiesList);
    console.log("Total employees in companies identified: " + totalEmployees);
    console.log("Total unique companies: " + companiesList.length);
    console.log("Average number of employees per company: " + Math.floor(totalEmployees / companiesList.length));
}
