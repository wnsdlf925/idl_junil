var express = require('express');
var app = module.exports = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const port = 3000
var mysql = require("mysql")
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sksmsrhfo",
    database: "ideapf",
    multipleStatements: true
  })


var options = {
	host: "localhost",
  user: "root",
  password: "sksmsrhfo",
  database: "ideapf",
};

var sessionStore = new MySQLStore(options);

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

app.post('/login',(req, res)=>{
    console.log(req.session )

res.send("dge")
})

app.get('/loginout',(req, res)=>{
    console.log(req.session )
    res.send("dge")

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);


var connection = mysql.createConnection(options); // or mysql.createPool(options);
var sessionStore = new MySQLStore({}/* session store options */, connection);