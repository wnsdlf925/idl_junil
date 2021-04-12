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
var moment = require('moment');//시간
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const realPhone = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호 정규식
const realEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식


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
              console.log("session ok")
             
            })
            var sql = "update admin_log set admin_login_lately = now() where admin_email = ?;"
            var param = [req.session.myEmail]
            connection.query(sql,param, function (err, result) {

              connection.release();
              console.log("로그인 성공")
              res.json({ login: 'ok' })
            })
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



//관리자 가입
app.post('/join', (req, res) => {


  if (realPhone.test(req.body.admin_phone) == true && realEmail.test(req.body.admin_email) == true) {//전화번호 정규식


    pool.getConnection(async function (err, connection) {
      if (!err) {
        
        var sql = "INSERT INTO admin(admin_email, admin_name, admin_sex, admin_birth, admin_state, admin_pw, admin_phone) VALUE(?,?,?,?,?,?,?);" +
          "INSERT INTO admin_log (admin_email, admin_log_join, admin_login_lately) VALUE(?,now(),now());"
        var param = [req.body.admin_email, req.body.admin_name, req.body.admin_sex, req.body.admin_birth, req.body.admin_state, func.Pass(req.body.admin_pw), func.Encrypt(req.body.admin_phone), req.body.admin_email]
        connection.query(sql, param, function (err, rows, fields) {
          if (!err) {
            req.session.adMyEmail = req.body.admin_email
            req.session.adMyPw = req.body.admin_pw
            req.session.adMyName = req.body.admin_name
            req.session.adMySex = req.body.admin_sex
            req.session.adMyBirth = req.body.admin_birth
            req.session.adMyState = req.body.admin_state
            req.session.adMyPhone = req.body.admin_phone
            
            req.session.save(() => {
              console.log("session ok")
            })
            console.log('성공')
            console.log("DB Connection Succeeded")
            connection.release();
            res.json({ move: '/' })
          } else {
            console.log("DB Connection Failed")
            console.log(err)
            connection.release();
            res.json({ err: 'DB Connection Failed' })
          }
        })
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.json({ err: 'pool err' })
      }
    })
  } else {
    res.json({ fail: '전화번호나 이메일이 형식에 맞지 않습니다.' })
  }
})


//사용자 정지
app.post('/userBan',func.adChkSession ,(req,res)=>{
  
  pool.getConnection(async function (err, connection) {
    if (!err) {
      
      var sql = "SELECT member_ban FROM member WHERE member_email = ?;" 
      var param = [req.body.member_email]
      connection.query(sql, param, function (err, result) {
        if(!err){
          if(result[0].member_ban == 1){
            res.json({ userBan: 'already ban' })
          }else{
            
            var sql = "INSERT INTO member_ban(member_email, member_ban_reason, member_ban_date, admin_email) VALUE (?,?,now(),?);" +
            "UPDATE member SET member_ban = 1 WHERE member_email = ?"
            
            var param = [req.body.member_email, req.body.reason, req.session.adMyEmail, req.body.member_email]
            connection.query(sql, param, function (err, rows, fields) {
              if (!err) {
                connection.release();
                res.json({ userBan: 'ok' })
              } else {
                
                connection.release();
                res.json({ db: err })
              }
            })
            
            
          }
        }else{
          
          connection.release();
          res.json({ db: err })
        }
      })
        
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.json({ err: 'pool err' })
      }
    })
    
  })


  //사용자 정지내역 보기
  app.get('/userBan/log',func.adChkSession ,(req,res)=>{
    var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from member_ban ORDER BY member_ban_date DESC limit ?,?;" +
        "select count(member_email) as num from member_ban;"
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })
})


//사용자 정지내역 상세보기
app.get('/userBan/detail', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from member_ban where member_email=?;"
      var param = [req.query.send]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })

})


//사용자 정지내역 검색
app.get('/userBan/search',func.adChkSession , (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if (func.checkSpace(req.query.send)) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        //게시물 찾기
        var sql = "select * from member_ban where  match(member_ban_reason) against(? IN boolean mode) ORDER BY member_ban_date DESC limit 0,15;" +
          "select count(member_email) as num from member_ban where match(member_ban_reason) against(? IN boolean mode)"
        var param = [req.query.send + '*', limit, pageNum, req.query.send + '*']
        connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0][0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.json({ db: "err" })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({ pool: "err" })
      }
    })
  } else {
    console.log("검색어 공백")
    res.json({ result: "검색어 공백" })
  }
})



//회원 탈퇴 시키기
app.post('/userSecede', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "UPDATE member set member_secede = 1 where member_email = ?"
      var param = [req.body.email]
      connection.query(sql, param, function (err, result) {
        if(!err){
          connection.release();
        console.log("풀 에러")
        res.json({ userSecede: "ok" })
        }else{
        connection.release();
        console.log("풀 에러")
        res.json({ db: err })
        }
          
          
        
          
      })
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({ pool: err })
      }
      
      
  })

})


//탈퇴회원 보기
app.get('/userSecede/log', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from member where member_secede = 1 ORDER BY member_name DESC limit ?,?;" +
        "select count(member_email) as num from member where member_secede = 1;"
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })

})

//탈퇴회원 상세
app.get('/userSecede/detail', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from member where member_email=? and member_secede = 1;"
      var param = [req.query.email]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })

})

//탈퇴회원 검색
app.get('/userSecede/search',func.adChkSession , (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  if (func.checkSpace(req.query.send)) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        //게시물 찾기
        var sql = "select * from member where member_secede and  match(member_name) against(? IN boolean mode) ORDER BY member_name DESC limit ?,?;" +
          "select count(member_email) as num from member where member_secede and match(member_name) against(? IN boolean mode)"
        var param = [req.query.send + '*', limit, pageNum, req.query.send + '*']
        connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0][0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.json({ db: "err" })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({ pool: "err" })
      }
    })
  } else {
    console.log("검색어 공백")
    res.json({ result: "검색어 공백" })
  }
})



//회원들의 로그보기
app.get('/userLog', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from member_log  ORDER BY member_login_lately DESC limit ?,?;" +
        "select count(member_email) as num from member_log  ORDER BY member_login_lately DESC ;"
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })

})


//회원들의 로그보기 검색
app.get('/userLog/search',func.adChkSession , (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  if (func.checkSpace(req.query.send)) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        //게시물 찾기
        var sql = "select * from member_log where match(member_email) against(? IN boolean mode) ORDER BY member_login_lately DESC limit ?,?;" +
          "select count(member_email) from member_log where match(member_email) against( ? IN boolean mode) "
        var param = [req.query.send + '*', limit, pageNum, req.query.send + '*']
        connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0][0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.json({ db: "err" })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({ pool: "err" })
      }
    })
  } else {
    console.log("검색어 공백")
    res.json({ result: "검색어 공백" })
  }
})


//회원들의 총 로그인 로그보기
app.get('/totalUserLog', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from member_login_log  ORDER BY member_login DESC limit ?,?;" +
        "select count(member_login) as num from member_login_log "
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.json({ db: "err" })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({ pool: "err" })
    }
  })

})


//회원들의 총 로그인 로그보기 검색
app.get('/totalUserLog/search',func.adChkSession , (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  if (func.checkSpace(req.query.send)) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        //게시물 찾기
        var sql = "select * from member_login_log where match(member_email) against(? IN boolean mode) ORDER BY member_login DESC limit ?,?;" +
          "select count(member_email) from member_log where match(member_email) against( ? IN boolean mode) "
        var param = [req.query.send + '*', limit, pageNum, req.query.send + '*']
        connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0][0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.json({ db: "err" })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({ pool: "err" })
      }
    })
  } else {
    console.log("검색어 공백")
    res.json({ result: "검색어 공백" })
  }
})

    
//공지사항 올리기
    app.post('/noticeUpload',func.adChkSession , upload.array('sendImg'), function(req, res ) {
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