const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createUsers() {
  return [
    {
      id: 1,
      username: "test-user-1",
      fullname: "Test user 1",
      email: "TU1@gmail.com",
      password: "password123!",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      date_modified: new Date("2029-01-22T16:28:32.615Z"),
      gender: "female"
    },
    {
      id: 2,
      username: "test-user-2",
      fullname: "Test user 2",
      email: "TU2@gmail.com",
      password: "password123!",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      date_modified: new Date("2029-01-22T16:28:32.615Z"),
      gender: "male"
    },
    {
      id: 3,
      username: "test-user-3",
      fullname: "Test user 3",
      email: "TU3@gmail.com",
      password: "password123!",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      date_modified: new Date("2029-01-22T16:28:32.615Z"),
      gender: "male"
    },
    {
      id: 4,
      username: "test-user-4",
      fullname: "Test user 4",
      email: "TU4@gmail.com",
      password: "password123!",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      date_modified: new Date("2029-01-22T16:28:32.615Z"),
      gender: "female"
    }
  ];
}

function createLogs(users) {
  return [
    {
      id: 1,
      nickname: "Stinky",
      note: "First test post!",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      style: "1",
      color: "yellow",
      amount: "a lot"
    },
    {
      id: 2,
      nickname: "Stinky1",
      note:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      style: "4",
      color: "black",
      amount: "little"
    },
    {
      id: 3,
      nickname: "Stinky2",
      note:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque",
      user_id: users[2].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      style: "7",
      color: "brown",
      amount: "normal"
    },
    {
      id: 4,
      nickname: "Stinky3",
      note:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque",
      user_id: users[3].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      style: "5",
      color: "green",
      amount: "normal"
    }
  ];
}

function createExpectedLog(users, log) {
  const owner = users.find(user => user.id === log.user_id);

  return {
    id: id,
    nickname: log.nickname,
    note: log.note,
    date_created: log.date_created,
    user_id: owner.id,
    style: log.style,
    color: log.color,
    amount: log.amount
  };
}

function createMaliciousLog(user) {
  const maliciousLog = {
    id: 10,
    nickname:
      "Malicious image <img src='https://thisisabad.site/siteisfake' onerror='alert(document.cookie);'>.",
    note: "Very malicious script <script>alert('xss');</script>",
    user_id: user.id,
    date_created: new Date("2029-01-22T16:28:32.615Z"),
    style: "3",
    color: "red",
    amount: "a lot"
  };
  const expectedLog = {
    ...createExpectedLog([user], maliciousLog),
    nickname:
      "Malicious image <img src='https://thisisabad.site/siteisfake' onerror='alert(document.cookie);'>.",
    note: "Very malicious script <script>alert('xss');</script>"
  };
  return {
    maliciousLog,
    expectedLog
  };
}

function createLogsFixtures() {
  const testUsers = createUsers();
  const testLogs = createLogs(testUsers);
  return { testUsers, testLogs };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        logs,
        users
      `
    )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into("users").insert(preppedUsers);
}

function seedLogs(db, users, logs) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("logs").insert(logs);
  });
}

function seedMaliciousLog(db, user, log) {
  return seedUsers(db, [user]).then(() => db.into("logs").insert([log]));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

module.exports = {
  createUsers,
  createLogs,
  createExpectedLog,
  createMaliciousLog,
  createLogsFixtures,
  cleanTables,
  seedUsers,
  seedLogs,
  seedMaliciousLog,
  makeAuthHeader
};
