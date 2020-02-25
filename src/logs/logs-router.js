// Library
const express = require("express");

// Service
const LogsService = require("./logs-service");
const UsersService = require("../users/users-service");

// Router
const logsRouter = express.Router();

// Middleware
const { requireAuth } = require("../middleware/jwt-auth");
const jsonBodyParser = express.json();

// Possible enum entries
const enumData = {
  style: ["1", "2", "3", "4", "5", "6", "7"],
  color: ["black", "brown", "green", "yellow", "gray", "red"],
  amount: ["little", "normal", "a lot"]
};

logsRouter
  .route("/")
  .all(requireAuth)
  .get(jsonBodyParser, (req, res, next) => {
    // Get user and user logs
    UsersService.getUserById(req.app.get("db"), req.user.id)
      .then(user => {
        LogsService.getUserLogs(req.app.get("db"), user.id).then(logs => {
          res.json({
            logs: logs.map(LogsService.serializeLog),
            user: UsersService.serializeUser(user)
          });
        });
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { nickname, note, date_created, style, color, amount } = req.body;
    const newLog = { nickname, date_created, style, color, amount };

    // Validate if required data is provided
    for (const [key, value] of Object.entries(newLog))
      if (value == null) {
        return res.status(400).json({
          error: `Request body must contain '${key}'`
        });
      }

    // Validate enum fields
    for (const [key, value] of Object.entries(enumData))
      if (!enumData[key].includes(newLog[key])) {
        return res.status(400).json({
          error: `'${key}' value could only be one of the following options: ${value}`
        });
      }

    // Add on optional data if provided
    if (note !== undefined) {
      newLog.note = note;
    }
    newLog.user_id = req.user.id;

    LogsService.insertLog(req.app.get("db"), newLog)
      .then(log => res.status(201).json(LogsService.serializeLog(log)))
      .catch(next);
  });

logsRouter
  .route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    // Check if log exist or if log belong to the user
    LogsService.getLogById(req.app.get("db"), req.params.id).then(log => {
      if (!log || log.user_id != req.user.id) {
        return res.status(404).json({
          error: `Log doesn't exist`
        });
      }
      res.log = log;
      next();
    });
  })
  .delete((req, res, next) => {
    LogsService.deleteLog(req.app.get("db"), res.log.id)
      .then(() => res.status(204).end())
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { nickname, note, style, color, amount } = req.body;
    const logToUpdate = { nickname, note, style, color, amount };

    // Validate at least 1 fields is being updated
    const totalValues = Object.values(logToUpdate).filter(Boolean).length;
    if (totalValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'nickname', 'note', 'style, 'color', or 'amount'`
      });
    }

    // Check that values of enum fields are appropriate
    for (const [key, value] of Object.entries(enumData))
      if (
        logToUpdate.hasOwnProperty(key) &&
        !enumData[key].includes(logToUpdate[key])
      ) {
        return res.status(400).json({
          error: `'${key}' value could only be one of the following options: ${value}`
        });
      }

    LogsService.updateLog(req.app.get("db"), res.log.id, logToUpdate)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = logsRouter;
