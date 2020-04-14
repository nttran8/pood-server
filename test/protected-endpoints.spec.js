const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function() {
  let db;

  const { testUsers, testLogs } = helpers.createLogsFixtures();
  before("Make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("Disconnect from database", () => db.destroy());

  before("Destroy tables", () => helpers.cleanTables(db));

  afterEach("Destroy tables", () => helpers.cleanTables(db));

  beforeEach("Insert Logs", () => helpers.seedLogs(db, testUsers, testLogs));

  const protectedEndpoints = [
    {
      name: "DELETE /api/users/:id",
      path: "/api/users/1",
      method: supertest(app).delete
    },
    {
      name: "PATCH /api/users/:id",
      path: "/api/users/1",
      method: supertest(app).patch
    },
    {
      name: "GET /api/logs",
      path: "/api/logs",
      method: supertest(app).get
    },
    {
      name: "POST /api/logs",
      path: "/api/logs",
      method: supertest(app).post
    },
    {
      name: "DELETE /api/logs/:id",
      path: "/api/logs/1",
      method: supertest(app).delete
    },
    {
      name: "PATCH /api/logs/:id",
      path: "/api/logs/1",
      method: supertest(app).patch
    }
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`Responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`Responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = "not-a-valid-secret";
        return endpoint
          .method(endpoint.path)
          .set(
            "Authorization",
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });

      it(`Responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: "user-does-not-exist", id: 1 };
        return endpoint
          .method(endpoint.path)
          .set("Authorization", helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
