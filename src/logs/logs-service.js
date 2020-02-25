const xss = require("xss");

const LogsService = {
  // Get logs that belonged to the specified user
  getUserLogs(knex, user_id) {
    return knex("logs")
      .select("*")
      .where({ user_id });
  },
  // Insert data
  insertLog(knex, log) {
    return knex("logs")
      .insert(log)
      .returning("*")
      .then(rows => rows[0]);
  },
  // Get data by id
  getLogById(knex, id) {
    return knex("logs")
      .select("*")
      .where({ id })
      .first();
  },
  // Update data
  updateLog(knex, id, log) {
    return knex("logs")
      .where({ id })
      .update(log);
  },
  // Remove data
  deleteLog(knex, id) {
    return knex("logs")
      .where({ id })
      .delete();
  },
  // Serialize data
  serializeLog(log) {
    return {
      id: log.id,
      nickname: xss(log.nickname),
      note: xss(log.note),
      date_created: log.date_created,
      user_id: log.user_id,
      style: log.style,
      color: log.color,
      amount: log.amount
    };
  }
};

module.exports = LogsService;
