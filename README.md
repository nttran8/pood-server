# Poo'd

An open-source RESTful API created to support the following features:

- Register, update, delete users
- Create, update, delete logs
- Authenticate user that also retrieve user's information and logs
- Maintain session with token
- Grant refresh token

## Tech Stack

- Javascript
- Express
- Node
- Knex
- PostgreSQL
- JSONWebtoken
- BCrypt
- XSS

## Endpoints

- /api/users
- /api/users/:id
- /api/logs
- /api/logs/:id
- /api/auth/login
- /api/auth/refresh

### /api/users

| Title            | Create User                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL              | /api/users                                                                                                                                                                                                                |
| Method           | POST                                                                                                                                                                                                                      |
| URL Params       | None                                                                                                                                                                                                                      |
| Data Params      | {username: [string], email: [string], password: [alphanumeric]}                                                                                                                                                           |
| Success Response | Code: 201 <br>Content: {<br>id: 5,<br>fullname: "",<br>email: "jess_123@gmail.com",<br>username: "jess_123",<br>date_created: "2020-03-02T14:19:40.900Z",<br>date_modified: null,<br>gender: null<br>} <br>Location: /:id |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must include email"}                                                                                                                                              |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must include username"}                                                                                                                                           |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must include password"}                                                                                                                                           |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Username already taken"}                                                                                                                                                       |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Email must contain a single @ followed by a domain name"}                                                                                                                      |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must be longer than 8 characters"}                                                                                                                                    |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must be less than 72 characters"}                                                                                                                                     |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must not start or end with empty spaces"}                                                                                                                             |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character !@#\$%^&"}                                                                                   |

| Title            | Update User                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| URL              | /api/users/:id                                                                                                                          |
| Method           | PATCH                                                                                                                                   |
| URL Params       | Required:<br> id=[integer]                                                                                                              |
| Data Params      | {<br>fullname: [string],<br>email: [string],<br>password: [alphanumeric],<br>gender: [enum]<br>}                                        |
| Success Response | Code: 204                                                                                                                               |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must contain either 'email', 'fullname', 'password', or 'gender'"}              |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "'Gender' value could only be either female or male"}                                         |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must include a value for email"}                                                |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Request body must include a value for password"}                                             |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Email must contain a single @ followed by a domain name"}                                    |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must be longer than 8 characters"}                                                  |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must be less than 72 characters"}                                                   |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must not start or end with empty spaces"}                                           |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character !@#\$%^&"} |
| Error Response   | Code: 401 Unauthorized<br>Content: {error: "Missing bearer token"}                                                                      |

| Title            | Delete User                                                      |
| ---------------- | ---------------------------------------------------------------- |
| URL              | /api/users/:id                                                   |
| Method           | DELETE                                                           |
| URL Params       | Required:<br> id=[integer]                                       |
| Data Params      | None                                                             |
| Success Response | Code: 204                                                        |
| Error Response   | Code: 401 Unauthorized<br>Content: {error: "Cannot delete user"} |

### /api/logs

| Title            | Create Log                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL              | /api/logs                                                                                                                                                                                |
| Method           | POST                                                                                                                                                                                     |
| URL Params       | None                                                                                                                                                                                     |
| Data Params      | {<br>nickname: [string],<br> date_created: [timestamp],<br> style: [enum],<br> color: [enum],<br> amount: [enum]<br>}                                                                    |
| Success Response | Code: 201<br>Content: {<br>id: 1,<br>nickname: "log",<br>note: "",<br>date_created: "2020-01-01T08:00:00.000Z",<br>user_id: 1,<br>style: "1",<br>color: "brown",<br>amount: "a lot"<br>} |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "nickname is required"}                                                                                                                        |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "date_created is required"}                                                                                                                    |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "style is required"}                                                                                                                           |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "color is required"}                                                                                                                           |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "amount is required"}                                                                                                                          |  | Error Response | Code: 400 Bad Request<br>Content: {error: "style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7"} |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "color value could only be one of the following options: black, brown, green, yellow, gray, red"}                                              |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "amount value could only be one of the following options: little, normal, a lot"}                                                              |
| Error Response   | Code: 400 Bad Request<br>Content: {error: "style value could only be one of the following options: 1,2,3,4,5,6,7"}                                                                       |
| Error Response   | Code: 401 Unauthorized<br>Content: {error: "Missing bearer token"}                                                                                                                       |

| Title            | Get All Logs                                                     |
| ---------------- | ---------------------------------------------------------------- |
| URL              | /api/logs                                                        |
| Method           | GET                                                              |
| URL Params       | None                                                             |
| Data Params      | None                                                             |
| Success Response | Code: 204                                                        |
| Error Response   | Code: 401 Unauthorized<br>Content: {error: "Cannot delete user"} |

### /api/auth
