BEGIN;

TRUNCATE
  logs,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, fullname, email, password, date_created, date_modified, gender)
VALUES
  ('dunder', 'Dunder Mifflin', 'dunder@gmail.com', '$2a$12$1N7HS4b3LoSUDINe7GmUHeCfLSn/FcZOopJl1GvlPEzhb.OodkEXW', '2029-01-22T16:28:32.615Z', '2029-01-22T16:28:32.615Z', null),
  ('b.deboop', 'Bodeep Deboop', 'bo@gmail.com', '$2a$12$1N7HS4b3LoSUDINe7GmUHeCfLSn/FcZOopJl1GvlPEzhb.OodkEXW', '2029-01-22T16:28:32.615Z', '2029-01-22T16:28:32.615Z', 'female'),
  ('ssssmith', null, 'sam@gmail.com', '$2a$12$1N7HS4b3LoSUDINe7GmUHeCfLSn/FcZOopJl1GvlPEzhb.OodkEXW', '2029-01-22T16:28:32.615Z', '2029-01-22T16:28:32.615Z', null),
  ('wippy', null, 'ping@gmail.com', '$2a$12$1N7HS4b3LoSUDINe7GmUHeCfLSn/FcZOopJl1GvlPEzhb.OodkEXW', '2021-01-22T16:28:32.615Z', '2029-01-22T16:28:32.615Z', 'male');

INSERT INTO logs (nickname, note, date_created, user_id, style, color, amount)
VALUES
  ('stinkii poo', 'this one smells like spinach', '2029-03-22T16:28:32.615Z', 1, '4', 'green', 'normal'),
  ('dookey', 'pungent ...really', '2000-01-22T16:28:32.615Z', 1, '3', 'brown', 'little'),
  ('chichi', 'hard dots and smells the worst', '2021-01-22T16:28:32.615Z', 3, '1', 'black', 'a lot'),
  ('sticky swirls', 'soft and smelly', '2021-01-22T16:28:32.615Z', 2, '5', 'gray', 'normal'),
  ('fiberish', 'I see green bits', '2019-01-22T16:28:32.615Z', 1, '4', 'green', 'little'),
  ('stinkii poo', 'this one smells like durian', '2010-01-22T16:28:32.615Z', 1, '4', 'yellow', 'a lot'),
  ('doodoo', 'the perfect shaped doo - I feel healthy', '2021-01-22T16:28:32.615Z', 3, '4', 'brown', 'normal'),
  ('dung do it', 'maybe I ate something bad', '2021-03-22T16:28:32.615Z', 1, '5', 'brown', 'a lot'),
  ('stinkii poo', 'a little red - maybe from hot cheatos', '2021-01-22T16:28:32.615Z', 1, '3', 'red', 'normal'),
  ('baboop', 'very messy and smells horrible', '2021-02-24T16:28:32.615Z', 4, '7', 'black', 'a lot'),
  ('swirllsss', 'swirls', '2021-06-22T16:28:32.615Z', 2, '6', 'brown', 'normal'),
  ('rocki', null, '2021-11-02T16:28:32.615Z', 1, '2', 'yellow', 'little'),
  ('loggs', null, '2021-02-22T16:28:32.615Z', 2, '3', 'green', 'normal');



COMMIT;
