//-------------------------------------- Import/require modules
// Create variables written in .env file to the environment
require('dotenv').config();
// Enable access to request and response objects
const express = require('express');
// Enable HTTP request logger
const morgan = require('morgan');
// Enable CORS
const cors = require('cors');
// Secure HTTP response headers
const helmet = require('helmet');
// Load configured variables
const { NODE_ENV } = require('./config');
// Enable logging failures
const winston = require('winston');
// Enable id generation
const uuid = require('uuid/v4');

// Create express app to communicate with express server
const app = express();

// Set up winston
// Has 6 levels of severity: silly, debug, verbose, info, warn and error
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

// Depends on the condition of the environment
// Morgan - tiny format for production environment
// Morgan - common format for development environment
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';









//-------------------------------------- Mounting our middleware
app.use(morgan(morganOption));
// Hide HTTP response headers before sending cross origins
// Use helmet before cors
app.use(helmet());
app.use(cors());
// Use to parse JSON body of request
app.use(express.json());
// Validate API key
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    // Logs error to terminal
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
})
// Create error if any
app.use(function errorHandler(error, req, res, next) {
  let response;
   if (NODE_ENV === 'production') {
     response = { error: { message: 'server error' } };
   } else {
     console.error(error);
     response = { message: error.message, error };
   }
   res.status(500).json(response);
 });







 //-------------------------------------- Endpoints configuration
 app.get('/', (req, res) => {
  res.send('Hello, Nghi!');
});

module.exports = app;