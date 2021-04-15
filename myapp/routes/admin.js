const express = require('express')
const app = express()
app.use(express.json())
var urlencode = require('urlencode');
require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js')//함수
let upload = require('../common/upload.js');//파일 업로드
var crawl = require('../common/crawl');
var fs = require('fs');
let session = sess.session
app.use(session)
const pageNum = 15
var moment = require('moment');//시간
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const realPhone = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호 정규식
const realEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식



var cron = require('node-cron');


cron.schedule('* * 23 * * *', async() => {
//inserCrawl()
// await func.insertRank()
//  checkCrawl()
console.log("dddd")
//랭킹
},{
  scheduled: true,
   timezone: "Asia/Seoul"
});


//크롤링 insert
app.get('/insert', func.adChkSession ,async(req, res) => {

  if(await crawl.inserCrawl()){

    res.status(200).json({ crawl: 'ok' })
  }else{
    res.status(400).json({ err: '1', contents: '크롤링 err' })
  }
    
  })



//관리자 게시물은 따로
//관리자 로그인
app.post('/login', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query("SELECT * from admin WHERE admin_email = '" + req.body.email + "'and admin_pw = '" + func.Pass(req.body.pw)+"'"+"and admin_secede = 0" , function (err, result) {
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
              res.status(200).json({ login: 'ok',move: '/' })
            })
          } else {
            console.log("로그인 실패")
            connection.release();
            res.status(400).json({ err: '3', contents: '아이디나 비번을 다시 확인' })
          }
        } else {
          console.log("에러: " + err)
          connection.release();
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀에러: " + err)
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
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
            res.status(200).json({ move: '/' })
          } else {
            console.log("DB Connection Failed")
            console.log(err)
            connection.release();
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    res.status(400).json({  err: '3', contents: '전화번호나 이메일이 형식에 맞지않습니다.'})
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
            res.status(400).json({  err: '3', contents: '이미 벤 당함' })
          }else{
            
            var sql = "INSERT INTO member_ban(member_email, member_ban_reason, member_ban_date, admin_email) VALUE (?,?,now(),?);" +
            "UPDATE member SET member_ban = 1 WHERE member_email = ?"
            
            var param = [req.body.member_email, req.body.reason, req.session.adMyEmail, req.body.member_email]
            connection.query(sql, param, function (err, rows, fields) {
              if (!err) {
                connection.release();
                res.status(200).json({ userBan: 'ok' })
              } else {
                
                connection.release();
                res.status(400).json({  err: '1', contents: '잘못된 값'})
              }
            })
            
            
          }
        }else{
          
          connection.release();
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
        
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패'})
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
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패'})
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
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({result: result,postNum: postNum})
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({  err: '1', contents: '잘못된 값'})
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
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
        res.status(200).json({ userSecede: "ok" })
        }else{
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '1', contents: '잘못된 값'})
        }
          
          
        
          
      })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결실패'})
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
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
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패'})
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
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
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({  err: '1', contents: '잘못된 값'})
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결싪패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
})

    

//아이디어 게시물에 포인트 주기
app.patch('/ideaPoint', func.adChkSession ,(req, res) => {
 
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "update idea set add_point = add_point + 500, date_point = curdate(), admin_email = ? where idea_id = ?;" +
        "update member set save_point  = save_point + 500, member_point = member_point+500 where member_email = ?"
        var param = [req.session.adMyEmail ,req.body.id, req.body.email ]
        connection.query(sql, param, function (err, result) {
        if (!err) {
            connection.release();
            res.status(200).json({ ideaPoint: "ok" })
          
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })

})



 //아이디어 게시물 포인트 회수
app.patch('/returnIdeaPoint', func.adChkSession ,(req, res) => {
 
  pool.getConnection(function (err, connection) {
    if (!err) {
      //게시물 포인트가 0인지 확인
      var sql = "select add_point from idea where idea_id = ?;"
      var param = [req.body.id]
      connection.query(sql, param, function (err, result) {
        if(!err){
          if(result[0].add_point != 0){
            console.log("0")
            
            var newsql = "update idea set add_point = add_point-500 where idea_id = ?;" +
            "update member set use_point  = use_point - 500, member_point = member_point-500 where member_email = ?;"+
            "INSERT INTO point(member_email, use_date, use_contents) VALUE( ?,now(),'포인트 회수') "
            var newparam = [req.body.id, req.body.email, req.body.email ]
            connection.query(newsql, newparam, function (err, result) {
              if (!err) {
                connection.release();
                res.status(200).json({ ideaPoint: "ok" })
                
              } else {
                connection.release();
                console.log(err)
                res.status(400).json({  err: '1', contents: '잘못된 값'})
              }
            })
          }else{
            connection.release();
            console.log(err)
            res.status(400).json({ result: "empty" })
          }
      }else{
        connection.release();
    console.log("db 에러")
    res.status(400).json({  err: '1', contents: '잘못된 값'})
      }
        
    
  })
    
    

  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({ err: '2', contents: 'db 연결실패'})
  }
})

})

//관리자 탈퇴
app.patch('/secede', func.adChkSession ,(req, res) => {
 
  pool.getConnection(function (err, connection) {
    if (!err) {
      
      //게시물 
      var sql = "update admin set admin_secede = 1 where admin_email = ?;" 
      var param = [req.session.adMyEmail]
      connection.query(sql, param, function (err, result) {
      if (!err) {
        req.session.destroy(function (err) {
          if (!err) {
            connection.release();
            console.log("관리자 탈퇴");
            res.status(200).json({ move: "/" })
          } else {
            connection.release();
            console.log("세션에러", err);
            res.status(400).json({  err: '5', contents: '세션 err'})
          }
        });
          
        
      } else {
        connection.release();
        console.log(err)
        res.status(400).json({ err: '1', contents: '잘못된 값' })
      }
    })
  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({  err: '2', contents: 'db 연결실패' })
  }
})

})




//문의게시판 답변하기, 수정도 같이
app.patch('/csAnswer', func.adChkSession ,(req, res) => {
 
  pool.getConnection(function (err, connection) {
    if (!err) {
      
      //게시물 
      var sql = "update cs set admin_email = ?, cs_resp = ?, cs_resp_date = curdate() where cs_id =? " 
      var param = [req.session.adMyEmail, req.body.resp , req.body.id]
      connection.query(sql, param, function (err, result) {
      if (!err) {
        connection.release();

        res.status(200).json({ csAnswer: "ok" })
      } else {
        connection.release();
        console.log(err)
        res.status(400).json({  err: '1', contents: '잘못된 값' })
      }
    })
  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({ err: '2', contents: 'db 연결실패' })
  }
})

})


//문의게시판 로그보기
app.get('/csLog', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "SELECT * FROM cs inner join cs_log where cs.cs_id = cs_log.cs_id ORDER BY cs_edit_date DESC limit ?,?;" +
        "SELECT count(cs_log.cs_id) as num FROM cs inner join cs_log where cs.cs_id = cs_log.cs_id ; "
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({ err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })

})


//문의게시판 삭제
app.delete('/cs/delete',func.adChkSession , (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      
      //게시물 
      var sql = "update cs set cs_delete = 1 where cs_id =? " 
      var param = [req.body.id]
      connection.query(sql, param, function (err, result) {
      if (!err) {
        connection.release();

        res.status(200).json({ delete: "ok" })
      } else {
        connection.release();
        console.log(err)
        res.status(400).json({  err: '1', contents: '잘못된 값' })
      }
    })
  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({  err: '2', contents: 'db 연결실패'})
  }
})
})

//고객센터 보기
app.get('/contact', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from contact  ORDER BY contact_id DESC limit ?,?;" +
        "select count(contact_id) as num from contact "
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })

})
//고객센터 상세보기
app.get('/contact/detail', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from contact where contact_id=? ;"
      var param = [req.query.send]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })
})

//고객센터 답변하기
app.post('/contactAnswer', func.adChkSession ,(req, res) => {
 
pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT * from contact_log where contact_id = ?; " 
      var param = [req.body.id]
      connection.query(sql, param, async function (err, result) {
        console.log("result[0].contact_id:"+result[0])
        if(result[0] || null || undefined || 0 || NaN){
    
          await func.contactEmail(req.body.email,req.body.resp)
         
          // 게시물 
          var newsql = "INSERT INTO contact_log set contact_id = ?, contact_send = now(), contact_response = ? " 
          var newparam = [req.body.id,req.body.resp]
          connection.query(newsql, newparam, function (err, result) {
            if (!err) {
              connection.release();
              
              res.status(200).json({ csAnswer: "ok" })
            } else {
              connection.release();
              console.log(err)
              res.status(400).json({  err: '1', contents: '잘못된 값' })
            }
          })
          
          
        }else{
          connection.release();
              console.log(err)
              res.status(400).json({  err: '3', contents: '이미 답변함'})
        }
      
      
    })

  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({  err: '2', contents: 'db 연결실패' })
  }
})

})

//고객센터 로그보기
app.get('/contactLog', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from contact_log  ORDER BY contact_send DESC limit ?,?;" +
        "select count(contact_id) as num from contact_log "
        var param = [limit, pageNum]
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({ err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })

})


//고객센터 검색
app.get('/contact/search', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "select * from contact where match(contact_title) against(? IN boolean mode) ORDER BY contact_title DESC limit ?,?;" +
        "select count(contact_title) as num from contact where match(contact_title) against( ? IN boolean mode) "
        var param = [req.query.send + '*', limit, pageNum, req.query.send + '*']
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패'})
    }
  })

})


//아이디어 게시판 삭제하기
app.delete('/idea/delete',func.adChkSession , (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      
      var sql = "select add_point from idea where idea_id = ?;" 
      var param = [req.body.id]
      connection.query(sql, param, function (err, result) {
        if(!err){
          console.log("result[0].add_point: "+result[0].add_point)
          if(result[0].add_point == 0){
            
            var newsql = "update idea set idea_delete = 1 where idea_id =? "
            var newparam = [req.body.id]
            connection.query(newsql, newparam, function (err, result) {
              if (!err) {
                connection.release();
                
                res.status(200).json({ delete1: "ok" })
              } else {
                connection.release();
                console.log(err)
                res.status(400).json({  err: '1', contents: '잘못된 값' })
              }
            })
            
            
          }else{
            var adPoint = result[0].add_point
            var newsql = "update idea set idea_delete = 1 where idea_id =?; "+"update member set member_point = member_point - ?, save_point = save_point-? where member_email = (select member_email from idea where idea_id = ?);"+
            "update idea set add_point = 0 where idea_id = ?;"
            var newparam = [req.body.id, adPoint, adPoint, req.body.id,req.body.id]
            connection.query(newsql, newparam, function (err, result) {
              if (!err) {
                connection.release();
                
                res.status(200).json({ delete2: "ok" })
              } else {
                connection.release();
                console.log(err)
                res.status(400).json({  err: '1', contents: '잘못된 값' })
              }
            })
          }
          
        }else{
          connection.release();
                console.log(err)
                res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
        })
        
  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({  err: '2', contents: 'db 연결실패'})
  }
})
})

//아이디어 게시판 수정로그 보기
app.get('/ideaLog', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from idea_log where idea_log.idea_id=? ;"
      var param = [req.query.id]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })
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
                res.status(200).json({ notice: "ok" })
                
              }else{
                connection.release();
                console.log(req.body.title)
                res.status(400).json({  err: '1', contents: '잘못된 값' })
              }
              
            })
          }else{
            connection.release();
            console.log("풀 에러")
            res.status(400).json({  err: '2', contents: 'db 연결실패' })
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
                    res.status(200).json({ notice: "ok" })
                    
                  }else{
                    connection.release();
                    console.log(err)
                    res.status(400).json({  err: '1', contents: '잘못된 값' })
                  }
                  
                })
              
                
                
              }else{
                connection.release();
                console.log(req.body.title)
                res.status(400).json({  err: '1', contents: '잘못된 값'})
              }
              
            })
          }else{
            connection.release();
            console.log("풀 에러")
            res.status(400).json({  err: '2', contents: 'db 연결실패' })
          }
          })
      }
      
    })
      

//공지사항 수정
app.patch('/notice/Reset', func.adChkSession, upload.array('sendImg'), (req, res) => {
 
  //파일 삭제 -> 업데이트
      pool.getConnection(function (err, connection) {
        if (!err) {
          
          var sql =  "select *  FROM notice_file_dir WHERE notice_id=?;"
          var param = [req.body.notice_id]
          connection.query(sql, param, function (err, result) {
            if (!err) {
              
              var newsql = "UPDATE notice_log SET notice_edit_date = now(), notice_before_contents = (SELECT notice_contents from notice WHERE notice_id = ?) WHERE notice_id = ?;" +
                    "UPDATE notice SET notice_title = ? , notice_contents = ? WHERE notice_id = ?;" +"delete from notice_file_dir WHERE notice_id = ?;"
              var newparam = [req.body.notice_id, req.body.notice_id, req.body.notice_title, req.body.notice_contents, req.body.notice_id, req.body.notice_id ]
              console.log("111111111111111111111111111 ")
              var i = 0
              var j = 0
              while(result[i]!=null){
                //파일삭제
                fs.unlink("./"+ result[i].notice_file_path, function(err){
                  if( err ) {  console.log(err)}
                  console.log('file delete');
                });
                i++
              }
              console.log("22222222222222222222")
              while(req.files[j]!=null){
                newsql += "INSERT INTO notice_file_dir(notice_file_name, notice_file_path, notice_id) VALUE (?,?,?);"
                console.log("req.files[i].originalname: "+req.files[j].originalname)
                newparam = newparam.concat(req.files[j].originalname, req.files[j].path, req.body.notice_id)
                // console.log("req.files[i].path: "+req.files[i].path)
                j++
              }

              console.log("3333333333333333333333")

              console.log("newparam: "+newparam)
              
              
              connection.query(newsql, newparam, function (err, result) {
                    
                    if(!err){
                      
                      connection.release();
                      res.status(200).json({result:"ok"})
                    }else{
                      connection.release();
                      res.status(400).json({ err: '1', contents: '잘못된 값',err:err})
                    }
                  })
            } else {
              connection.release();
              
              res.status(400).json({  err: '1', contents: '잘못된 값',err:err })
            }
          })
        } else {
          connection.release();
          console.log("풀 에러")
          res.status(400).json({  err: '2', contents: 'db 연결실패'})
        }
      })
    
  
  })


  //공지사항 로그보기
  app.get('/noticeLog', func.adChkSession ,(req, res) => {
    var limit = 15 * (req.query.pageNum - 1)
      console.log('limit: ' + limit)
      pool.getConnection(function (err, connection) {
        if (!err) {
          
          //게시물 
          var sql = "select * from notice_log  ORDER BY notice_edit_date DESC limit ?,?;" +
          "select count(notice_id) as num from notice_log "
          var param = [limit, pageNum]
          connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결실패' })
      }
    })
  
  })


//공지사항 개인로그보기
app.get('/noticeLog/detail', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from notice_log where notice_log.notice_id=?;"
      var param = [req.query.id]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패'})
    }
  })
})


//공지사항 삭제
app.delete('/notice/delete',func.adChkSession , (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      
      //게시물 
      var sql = "update notice set notice_delete = 1 where notice_id =? " 
      var param = [req.body.id]
      connection.query(sql, param, function (err, result) {
      if (!err) {
        connection.release();

        res.status(200).json({ delete: "ok" })
      } else {
        connection.release();
        console.log(err)
        res.status(400).json({  err: '1', contents: '잘못된 값' })
      }
    })
  } else {
    connection.release();
    console.log("풀 에러")
    res.status(400).json({  err: '2', contents: 'db 연결실패'})
  }
})
})


//로그아웃
app.get('/logout', (req, res) => {

  req.session.destroy(function (err) {
    console.log("로그아웃");
    res.status(200).json({ move: '/' })
  });
})

//모든회원 정보보기
app.get('/memberInfo',func.adChkSession, (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
      console.log('limit: ' + limit)
      pool.getConnection(function (err, connection) {
        if (!err) {
          
          //게시물 
          var sql = "select * from member where member_secede = 0 ORDER BY member_name ASC limit ?,?;" +
          "select count(member_email) as num from member where member_secede = 0 "
          var param = [limit, pageNum]
          connection.query(sql, param, function (err, result) {
          if (!err) {
            if (result[0] == null) {
              connection.release();
              console.log("result:" + 0)
              res.status(400).json({ result: "empty" })
            } else {
              var postNum = func.checkPage(result[1][0].num)
              connection.release();
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({ err: '1', contents: '잘못된 값'})
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({  err: '2', contents: 'db 연결실패' })
      }
    })
  
})



//자세한 회원정보 보기
app.get('/memberInfo/detail', func.adChkSession ,(req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from member where member_email = ?;"
      var param = [req.query.email]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.status(200).json({
            result: result,
            phone: func.Decrypt(result[0].member_phone)
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })
})


//회원검색
app.get('/memberInfo/search', func.adChkSession ,(req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
    console.log('limit: ' + limit)
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 
        var sql = "SELECT member_email, member_name, member_sex FROM member WHERE MATCH (member_name) AGAINST ( ? IN BOOLEAN MODE) or MATCH (member_email) AGAINST ( ? IN BOOLEAN MODE) ORDER BY member_name DESC limit ?,?;" +
        "SELECT count(member_email) as num FROM member WHERE MATCH (member_name) AGAINST ( ? IN BOOLEAN MODE) or MATCH (member_email) AGAINST (? IN BOOLEAN MODE);"
        var param = [req.query.send + '*', req.query.send + '*',  limit, pageNum, req.query.send + '*', req.query.send + '*']
        connection.query(sql, param, function (err, result) {
        if (!err) {
          if (result[0] == null) {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          } else {
            var postNum = func.checkPage(result[1][0].num)
            connection.release();
            res.status(200).json({
              result: result,
              postNum: postNum
            })
          }
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '2', contents: 'db 연결실패' })
    }
  })

})






      module.exports = app;