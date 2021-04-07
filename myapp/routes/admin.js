const express = require('express')
const app = express()
app.use(express.json())
var urlencode = require('urlencode');
require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js')//함수
let upload = require('../common/upload.js');//파일 업로드
// const { connect } = require('./member.js');
// const { query } = require('../common/database.js');
let session = sess.session
app.use(session)
const pageNum = 15



//관리자 게시물은 따로
//관리자 로그인
app.post('/login', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query("SELECT * from admin WHERE admin_email = '" + req.body.email + "'and admin_pw = '" + func.Pass(req.body.pw)+"'" , function (err, result) {
        if (!err) {
          if (result[0] != null) {
            req.session.adMyEmail = result[0].admin_email
            req.session.adMyPw = result[0].admin_pw
            req.session.adMyName = result[0].admin_name
            req.session.adMySex = result[0].admin_sex
            req.session.adMyBirth = result[0].admin_birth
            req.session.adMyState = result[0].admin_state
            req.session.adMyPhone = func.Decrypt(result[0].admin_phone)
            console.log(req.session.adMyName)
            req.session.save(() => {
              console.log("리다이렉션")
              res.json({ move: '/' })
            })
            connection.release();
            console.log("로그인 성공")
          } else {
            console.log("로그인 실패")
            connection.release();
            res.json({ login: 'fail' })
          }
        } else {
          console.log("에러: " + err)
          connection.release();
          res.json({ db: 'err' })
        }
      })
    } else {
      connection.release();
      console.log("풀에러: " + err)
      res.json({ pool: 'err' })
    }
  })
})





















    
//공지사항 올리기
    app.post('/noticeUpload', upload.array('sendImg'), function(req, res ) {
      if(req.files[0]==null){
        pool.getConnection (function(err, connection){
          if(!err){
            var sql = "INSERT INTO notice(notice_title, notice_contents, notice_date, admin_email) VALUE(?, ?, curdate(),?);"+
            "INSERT INTO notice_log(notice_id, notice_edit_date, notice_before_contents ) VALUE((select MAX(notice_id) FROM notice WHERE admin_email=? and notice_title = ?), now(),?);"
            var param = [req.body.title, req.body.contents, req.session.adMyEmail, req.session.adMyEmail, req.body.title, req.body.contents]
            
            connection.query(sql, param, function(err,result){
              if(!err){
                connection.release();
                console.log("성공")
                res.json({ notice: "ok" })
                
              }else{
                connection.release();
                console.log(req.body.title)
                res.json({ db: "err" })
              }
              
            })
          }else{
            connection.release();
            console.log("풀 에러")
            res.json({ pool: "err" })
          }
          })
      }else{
        pool.getConnection (function(err, connection){
          if(!err){
            var sql = "INSERT INTO notice(notice_title, notice_contents, notice_date, admin_email) VALUE(?, ?, curdate(),?);"+
            "INSERT INTO notice_log(notice_id, notice_edit_date, notice_before_contents ) VALUE((select MAX(notice_id) FROM notice WHERE admin_email=? and notice_title = ?), now(),?);"
            var param = [req.body.title, req.body.contents, req.session.adMyEmail, req.session.adMyEmail, req.body.title, req.body.contents]
            
            connection.query(sql, param, function(err,result){
              if(!err){
                var i = 1
                var newsql = "INSERT INTO notice_file_dir(notice_file_name, notice_file_path, notice_id ) VALUE(?,?,(select MAX(notice_id) FROM notice WHERE admin_email=? ));"
                var ex =  [req.files[0].originalname ,req.files[0].path, req.session.adMyEmail]
                while(req.files[i]!=null){
                  newsql = newsql + "INSERT INTO notice_file_dir(notice_file_name, notice_file_path, notice_id ) VALUE(?,?,(select MAX(notice_id) FROM notice WHERE admin_email=? ));"
                  ex = ex.concat(req.files[i].originalname ,req.files[i].path, req.session.adMyEmail)
                  i++
                }
                param = ex
                
                  connection.query(newsql, param, function(err,result){
                    if(!err){
                    connection.release();
                    res.json({ notice: "ok" })
                    
                  }else{
                    connection.release();
                    console.log(err)
                    res.json({ db: err })
                  }
                  
                })
              
                
                
              }else{
                connection.release();
                console.log(req.body.title)
                res.json({ db: "err" })
              }
              
            })
          }else{
            connection.release();
            console.log("풀 에러")
            res.json({ pool: "err" })
          }
          })
      }
      
    })
      
      module.exports = app;