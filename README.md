# Poo'd

An open-source RESTful API with the following features:

- Register, update, delete users
- Create, read, update, delete logs
- Authenticate
- Maintain session with token
- Grant refresh token

## Tech Stack

- Javascript
- Express
- Node
- Knex
- PostgreSQL
- JSONWebtoken

## Endpoints

/api/users
/api/users/:id
/api/logs
/api/logs/:id
/api/auth/login
/api/auth/refresh

### /api/users

| Title       | Create Users           |
| ----------- | ---------------------- |
| URL         | /api/users             |
| Method      | POST                   |
| URL Params  | None                   |
| Data Params | {"username": [string], |

"email": [string],
"password": [alphanumeric]
}|
| Success Response | Code: 201
Content: {
id: 5,
fullname: "",
"email": "jess_123@gmail.com",
"username": "jess_123",
"date_created": "2020-03-02T14:19:40.900Z",
"date_modified": null,
"gender": null
}
Location: /:id |
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must include email"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must include username"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must include password"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Username already taken"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Email must contain a single @ followed by a domain name"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must be longer than 8 characters"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must be less than 72 characters"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must not start or end with empty spaces"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character !@#\$%^&"}|

| Title       | Update Users           |
| ----------- | ---------------------- |
| URL         | /api/users/:id         |
| Method      | PATCH                  |
| URL Params  | Required: id=[integer] |
| Data Params |

{
"fullname": [string],
"email": [string],
"password": [alphanumeric],
"gender": [enum]
}|
| Success Response | Code: 204|
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must contain either 'email', 'fullname', 'password', or 'gender'"}|
| Error Response | Code: 400 Bad Request
Content: {error: "'Gender' value could only be either female or male"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must include a value for email"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Request body must include a value for password"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Email must contain a single @ followed by a domain name"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must be longer than 8 characters"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must be less than 72 characters"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must not start or end with empty spaces"}|
| Error Response | Code: 400 Bad Request
Content: {error: "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character !@#\$%^&"}|
| Error Response | Code: 401 Unauthorized
Content: {error: "Missing bearer token"}|

| Title      | Delete Users   |
| ---------- | -------------- |
| URL        | /api/users/:id |
| Method     | DELETE         |
| URL Params | Required:      |

id=[integer] |
| Data Params | None |
| Success Response | Code: 204|
| Error Response | Code: 401 Unauthorized
Content: {error: "Cannot delete user"} |

### /api/logs

| Title            | Create Logs                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| URL              | /api/logs                                                                                     |
| Method           | POST                                                                                          |
| URL Params       | None                                                                                          |
| Data Params      | {nickname: [string], date_created: [timestamp], style: [enum], color: [enum], amount: [enum]} |
| Success Response | Code: 201                                                                                     |

Content: {
"id": 1,
"nickname": "log",
"note": "",
"date_created": "2020-01-01T08:00:00.000Z",
"user_id": 1,
"style": "1",
"color": "brown",
"amount": "a lot"
}|
| Error Response | Code: 400 Bad Request
Content: {error: "nickname is required"}|
| Error Response | Code: 400 Bad Request
Content: {error: "date_created is required"}|
| Error Response | Code: 400 Bad Request
Content: {error: "style is required"}|
| Error Response | Code: 400 Bad Request
Content: {error: "color is required"}|
| Error Response | Code: 400 Bad Request
Content: {error: "amount is required"}|
| Error Response | Code: 400 Bad Request
Content: {error: "style value could only be one of the following options: 1, 2, 3, 4, 5, 6, 7"}|
| Error Response | Code: 400 Bad Request
Content: {error: "color value could only be one of the following options: black, brown, green, yellow, gray, red"}|
| Error Response | Code: 400 Bad Request
Content: {error: "amount value could only be one of the following options: little, normal, a lot"}|
| Error Response | Code: 401 Unauthorized
Content: {error: "Missing bearer token"} |
