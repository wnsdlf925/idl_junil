let session = require('express-session')
let MySQLStore = require('express-mysql-session')(session)
require('dotenv').config()

var sess={}

let sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 3600000
})

sess.session = (session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 20 },
}));


module.exports = sess
