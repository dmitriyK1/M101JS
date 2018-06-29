const { MongoClient } = require('mongodb');
const commandLineArgs  = require('command-line-args');
const assert = require('assert');

const options = commandLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', (err, db) => {
    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    const query = queryDocument(options);
    const projection = {"_id": 1, "name": 1, "founded_year": 1,
                      "number_of_employees": 1, "crunchbase_url": 1};

    const cursor = db.collection('companies').find(query, projection);
    let numMatches = 0;

    cursor.forEach(
        doc => {
            numMatches = numMatches + 1;
            console.log( doc );
        },
        err => {
            assert.equal(err, null);
            console.log("Our query was:" + JSON.stringify(query));
            console.log("Matching documents: " + numMatches);
            return db.close();
        }
    );
});


const queryDocument = options => {
    console.log(options);

    const query = {
        "founded_year": {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        }
    };

    if ("employees" in options) {
        query.number_of_employees = { "$gte": options.employees };
    }

    return query;
}

function commandLineOptions() {
    const cli = commandLineArgs([
        { name: "firstYear", alias: "f", type: Number },
        { name: "lastYear", alias: "l", type: Number },
        { name: "employees", alias: "e", type: Number }
    ]);

    const options = cli.parse()

    if (!(("firstYear" in options) && ("lastYear" in options))) {
        console.log(cli.getUsage({
            title: "Usage",
            description: "The first two options below are required. The rest are optional."
        }));

        process.exit();
    }

    return options;
}
