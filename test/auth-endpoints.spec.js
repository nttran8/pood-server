const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Auth endpoints", function() {
  let db;

  const { testUsers } = helpers.createLogsFixtures();
  const testUser = testUsers[0];

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

  describe(`POST /api/auth/login`, () => {
    beforeEach("Insert users", () => helpers.seedUsers(db, testUsers));

    const requiredFields = ["username", "password"];

    // Return error if username or password is missing
    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password
      };

      it(`Responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Please include '${field}' in the body`
          });
      });
    });

    it(`Responds 400 'Username or password is incorrect' when bad username`, () => {
      const invalidUser = { username: "idoNotExist", password: "somePassword" };
      return supertest(app)
        .post("/api/auth/login")
        .send(invalidUser)
        .expect(400, { error: `Username or password is incorrect` });
    });

    it(`Responds 400 'Username or password is incorrect' when bad password`, () => {
      const invalidPassword = {
        username: testUser.username,
        password: "somePassword"
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(invalidPassword)
        .expect(400, { error: `Username or password is incorrect` });
    });

    it(`Responds 200 and JWT auth token using secret when valid credentials`, () => {
      const validCredentials = {
        username: testUser.username,
        password: testUser.password
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id }, // payload
        process.env.JWT_SECRET, // secret
        {
          subject: testUser.username, // sub
          expiresIn: "7d",
          algorithm: "HS256"
        }
      );
      return supertest(app)
        .post("/api/auth/login")
        .send(validCredentials)
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});
