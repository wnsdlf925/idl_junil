
const express = require('express')
const app = express()
app.use(express.json())
var urlencode = require('urlencode');
require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js')//함수
let session = sess.session
app.use(session)
const pageNum = 15

//참여자 순위와 목록















//공지사항 게시판
app.get('/notice', function(req, res, ) {


  res.json(result);
})


module.exports = app;