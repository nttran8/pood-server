const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Logs Endpoints", function() {
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

  describe(`GET /api/logs`, () => {
    context(`Given user has no logs`, () => {
      it(`Responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/logs")
          .set(
            "Authorization",
            helpers.makeAuthHeader(helpers.createUsers()[1]).expect(200, [])
          );
      });
    });

    context("Given user has logs", () => {
      beforeEach("Insert logs", () =>
        helpers.seedLogs(db, testUsers, testLogs)
      );

      it("Responds with 200 and all of the logs", () => {
        const testUser = helpers.createUsers()[0];
        const expectedLogs = testLogs.filter(
          log => log.user_id === testUser.id
        );
        return supertest(app)
          .get("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedLogs);
      });
    });

    context(`Given log with an XSS attack`, () => {
      const testUser = helpers.createUsers()[0];
      const { maliciousLog, expectedLog } = helpers.createMaliciousLog(
        testUser
      );

      beforeEach("Insert malicious log", () => {
        return helpers.seedMaliciousLog(db, testUser, maliciousLog);
      });

      it("Removes XSS attack content from log", () => {
        return supertest(app)
          .get(`/api/articles`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].nickname).to.eql(expectedLog.nickname);
            expect(res.body[0].note).to.eql(expectedLog.note);
          });
      });
    });
  });

  describe(`POST /api/logs`, () => {
    context("Log validation", () => {
      beforeEach("Insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = [
        "nickname",
        "date_created",
        "style",
        "color",
        "amount"
      ];

      requiredFields.forEach(field => {
        const testLog = testLog[0];
        const testUser = testUsers[0];
        const newLog = {
          nickname: "Stinky",
          date_created: new Date("2029-01-22T16:28:32.615Z"),
          style: "1",
          color: "yellow",
          amount: "a lot"
        };

        it(`Responds 400 required error when '${field}' is missing`, () => {
          delete newLog[field];

          return supertest(app)
            .post("/api/logs")
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(newLog)
            .expect(400, {
              error: `${field} is required`
            });
        });
      });

      it(`Responds 400 'color value could only be one of the following options: black, brown, green, yellow, gray, red' when color is invalid`, () => {
        const logInvalidColor = {
          nickname: "Stinky",
          date_created: new Date("2029-01-22T16:28:32.615Z"),
          style: "1",
          color: "magenta",
          amount: "a lot"
        };

        return supertest(app)
          .post("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(logInvalidColor)
          .expect(400, {
            error: `color value could only be one of the following options: black, brown, green, yellow, gray, red`
          });
      });

      it(`Responds 400 'amount value could only be one of the following options: little, normal, a lot' when amount is invalid`, () => {
        const logInvalidAmount = {
          nickname: "Stinky",
          date_created: new Date("2029-01-22T16:28:32.615Z"),
          style: "1",
          color: "brown",
          amount: "a ton"
        };

        return supertest(app)
          .post("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(logInvalidAmount)
          .expect(400, {
            error: `amount value could only be one of the following options: little, normal, a lot`
          });
      });

      it(`Responds 400 'style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7' when style is invalid`, () => {
        const logInvalidStyle = {
          nickname: "Stinky",
          date_created: new Date("2029-01-22T16:28:32.615Z"),
          style: "0",
          color: "brown",
          amount: "a lot"
        };

        return supertest(app)
          .post("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(logInvalidStyle)
          .expect(400, {
            error: `style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7`
          });
      });
    });

    context("Happy path", () => {
      it("Responds 201 and newly created and serialized log", () => {
        const testLog = testLog[0];
        const testUser = testUsers[0];
        const newLog = {
          nickname: "Stinky",
          date_created: new Date("2029-01-22T16:28:32.615Z"),
          style: "1",
          color: "yellow",
          amount: "a lot"
        };

        return supertest(app)
          .post("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(newLog)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.nickname).to.eql(newLog.nickname);
            expect(res.body.date_created).to.eql(newLog.date_created);
            expect(res.body.style).to.eql(newLog.style);
            expect(res.body.color).to.eql(newLog.color);
            expect(res.body.amount).to.eql(newLog.amount);
            expect(res.body.user_id).to.eql(testUser.id);
            expect(res.body.note).to.eql("");
          })
          .expect(res =>
            db
              .from("logs")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.nickname).to.eql(newLog.nickname);
                expect(row.date_created).to.eql(newLog.date_created);
                expect(row.style).to.eql(newLog.style);
                expect(row.color).to.eql(newLog.color);
                expect(row.amount).to.eql(newLog.amount);
              })
          );
      });
    });
  });

  describe(`DELETE /api/logs/:id`, () => {
    context(`Given log doesn't exist`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`Responds with 404`, () => {
        const log_id = 90;
        return supertest(app)
          .delete(`/api/logs/${log_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Log doesn't exist` });
      });
    });

    context("Given log exist", () => {
      beforeEach("Insert logs and users", () =>
        helpers.seedLogs(db, testUsers, testLogs)
      );

      it("Responds with 204", () => {
        const log_id = 2;
        return supertest(app)
          .delete(`/api/logs/${log_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(204);
      });
    });
  });

  describe(`PATCH /api/logs/:id`, () => {
    context(`Given log doesn't exist`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const log_id = 90;
        return supertest(app)
          .patch(`/api/logs/${log_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Log doesn't exist` });
      });
    });

    context("Given log exist", () => {
      beforeEach(() => helpers.seedLogs(db, testUsers, testLogs));

      context("Log validation", () => {
        beforeEach("Insert users", () => helpers.seedUsers(db, testUsers));

        it(`Responds 400 "Request body must contain either 'nickname', 'note', 'style, 'color', or 'amount'" when request body is invalid`, () => {
          const requiredFields = [
            "nickname",
            "note",
            "style",
            "color",
            "amount"
          ];
          const testUser = testUsers[0];
          let testLog = testLogs[0];
          requiredFields.forEach(field => {
            delete testLog[field];
          });

          return supertest(app)
            .patch(`/api/logs/${testLog.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(testLog)
            .expect(400, {
              error: `Request body must contain either 'nickname', 'note', 'style, 'color', or 'amount'`
            });
        });

        it(`Responds 400 'color value could only be one of the following options: black, brown, green, yellow, gray, red' when color is invalid`, () => {
          const testUser = testUsers[0];
          const logInvalidColor = {
            id: 1,
            color: "white"
          };

          return supertest(app)
            .patch(`/api/logs/${logInvalidColor.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(logInvalidColor)
            .expect(400, {
              error: `color value could only be one of the following options: black, brown, green, yellow, gray, red`
            });
        });

        it(`Responds 400 'amount value could only be one of the following options: little, normal, a lot' when amount is invalid`, () => {
          const testUser = testUsers[0];
          const logInvalidAmount = {
            id: 1,
            amount: "something"
          };

          return supertest(app)
            .patch(`/api/logs/${logInvalidAmount.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(logInvalidAmount)
            .expect(400, {
              error: `amount value could only be one of the following options: little, normal, a lot`
            });
        });

        it(`Responds 400 'style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7' when style is invalid`, () => {
          const testUser = testUsers[0];
          const logInvalidStyle = {
            id: 1,
            style: "0"
          };

          return supertest(app)
            .patch(`/api/logs/${logInvalidStyle.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(logInvalidStyle)
            .expect(400, {
              error: `style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7`
            });
        });
      });

      context("Happy path", () => {
        it("Responds 204", () => {
          let testLog = testLog[0];
          const testUser = testUsers[0];

          // Update fields that can be changed
          testLog.nickname = "updated nickname";
          testLog.note = "updated notes";
          testLog.style = "4";
          testLog.color = "black";
          testLog.amount = "little";

          return supertest(app)
            .patch(`/api/logs/${testLog.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(testLog)
            .expect(204)
            .expect(res =>
              // Check database is updated
              db
                .from("logs")
                .select("*")
                .where({ id: testLog.id })
                .first()
                .then(row => {
                  expect(row.nickname).to.eql(newLog.nickname);
                  expect(row.note).to.eql(newLog.note);
                  expect(row.style).to.eql(newLog.style);
                  expect(row.color).to.eql(newLog.color);
                  expect(row.amount).to.eql(newLog.amount);
                })
            );
        });
      });
    });
  });
});
