
var mysql = require("mysql")
require('dotenv').config()




//db
var pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  "connectionLimit": 10
})

//세션



module.exports = pool

