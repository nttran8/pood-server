const PoodService = require("../src/pood-service");
const pg = require("pg");
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
const knex = require("knex");

describe("Service object", function() {
  let db;
  let testData = [];

  // Hooks in mocha to connect to the database
  before(
    () =>
      (db = knex({
        client: "pg",
        connection: process.env.TEST_DB_URL
      }))
  );

  // Clears previous data in the table
  before(() => db("shopping_list").truncate());
  afterEach(() => db("shopping_list").truncate());

  // Disconnect the data after each test
  after(() => db.destroy());

  context(`Given db has data`, () => {
    // Insert test data before each it()
    beforeEach(() => {
      return db.into("shopping_list").insert(testList);
    });

    it();
  });

  context(`Given db has no data`, () => {
    it();
  });
});
