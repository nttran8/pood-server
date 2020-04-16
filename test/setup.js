// process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "godooers";
require("dotenv").config();
process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://postgres@localhost/pood-test";
const { expect } = require("chai");
const supertest = require("supertest");

// Set global variables
global.expect = expect;
global.supertest = supertest;
