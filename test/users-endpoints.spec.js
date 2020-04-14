const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users endpoints", function() {
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

  describe(`POST /api/users`, () => {
    context(`User validation`, () => {
      beforeEach("Insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = ["username", "password", "email"];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: "testUsername",
          password: "password123!",
          email: "tes123@t.com",
          nickname: "testNickname"
        };

        it(`Responds 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Request body must include '${field}'`
            });
        });
      });

      it(`Responds 400 'Email must contain a single @ followed by a domain name' when email is missing @`, () => {
        const userInvalidEmail = {
          username: "testUsername3",
          password: "1Aa!2Bb@a",
          email: "tes123.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userInvalidEmail)
          .expect(400, {
            error: `Email must contain a single @ followed by a domain name`
          });
      });

      it(`Responds 400 'Email must contain a single @ followed by a domain name' when email is missing domain name`, () => {
        const userInvalidEmail = {
          username: "testUsername3",
          password: "1Aa!2Bb@a",
          email: "tes123@"
        };
        return supertest(app)
          .post("/api/users")
          .send(userInvalidEmail)
          .expect(400, {
            error: `Email must contain a single @ followed by a domain name`
          });
      });

      it(`Responds 400 'Password must be longer than 8 characters' when password is short`, () => {
        const userShortPassword = {
          username: "testUsername3",
          password: "1234567",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userShortPassword)
          .expect(400, { error: `Password must be longer than 8 characters` });
      });

      it(`Responds 400 'Password must be less than 72 characters' when password is too long`, () => {
        const userLongPassword = {
          username: "testUsername3",
          password: "*".repeat(73),
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` });
      });

      it(`Responds 400 'Password must not start or end with empty spaces' when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          username: "testUsername3",
          password: " 1Aa!2Bb@2",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          });
      });

      it(`Responds 400 'Password must not start or end with empty spaces' when password starts with spaces`, () => {
        const userPasswordEndsSpaces = {
          username: "testUsername3",
          password: "1Aa!2Bb@2 ",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordEndsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          });
      });

      it(`Responds 400 error when password doesn't contain 1 uppercase, 1 lowercase, 1 number, and 1 special character`, () => {
        const userPasswordNotComplex = {
          username: "testUsername3",
          password: "11AAaabb2",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordNotComplex)
          .expect(400, {
            error: `Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character !@#$%^&`
          });
      });

      it(`Responds 400 'Username already taken' when username isn't unique`, () => {
        const duplicateUser = {
          username: testUser.username,
          password: "11AAaa!!!",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, { error: `Username already taken` });
      });
    });

    context(`Happy path`, () => {
      it(`Responds 201, serialized user, storing bcryped password`, () => {
        const newUser = {
          username: "newUser12345",
          password: "11AAaa!!2",
          email: "tes123@t.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body.fullname).to.eql("");
            expect(res.body.date_modified).to.eql(null);
            expect(res.body.gender).to.eql(null);
            expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            const expectedDate = new Date().toLocaleString("en", {
              timeZone: "UTC"
            });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from("users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                expect(row.email).to.eql(newUser.email);
                expect(row.fullname).to.eql("");
                expect(row.date_modified).to.eql(null);
                expect(row.gender).to.eql(null);
                const expectedDate = new Date().toLocaleString("en", {
                  timeZone: "UTC"
                });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});
