//인증시간 만료시간 백그라운드에서 말고 인증할때 확인하고 바꾸는 것으로
//**나중에 res.send 프론트에 맞게 설정하기**
// import {connection} from "mysql.js"




const express = require('express')
const app = express()
app.use(express.json())

require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js')//함수
let upload = require('../common/upload.js');//파일 업로드
var fs = require('fs');
let session = sess.session
app.use(session)
const pageNum = 15


const realPhone = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호 정규식
const realEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식



//시간
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");



//**나중에 res.send 프론트에 맞게 설정하기**
//pool로 바꾸기


//회원가입, 한번 가입했던 사람인지 확인
app.post('/join', (req, res) => {


  if (realPhone.test(req.body.member_phone) == true && realEmail.test(req.body.member_email) == true) {//전화번호 정규식
    pool.getConnection(async function (err, connection) {
      if (!err) {
        var joinlog = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(joinlog)
        var sql = "INSERT INTO ideapf.member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree, member_rank) VALUE(?,?,?,?,?,?,?,?,?,?);" +
          "INSERT INTO member_login_log (member_email,member_login) VALUE(?,?);" +
          "INSERT INTO member_log (member_email,member_log_join,member_login_lately) VALUE(?,?,?);"
        var param = [req.body.member_email, req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, func.Pass(req.body.member_pw), func.Encrypt(req.body.member_phone), req.session.chosenAgree, await func.RankCheck(), req.body.member_email, joinlog, req.body.member_email, joinlog, joinlog,]
        connection.query(sql, param, function (err) {
          if (!err) {
            req.session.myEmail = req.body.member_email
            req.session.myPw = req.body.member_pw
            req.session.myName = req.body.member_name
            req.session.mySex = req.body.member_sex
            req.session.myBirth = req.body.member_birth
            req.session.myCompany = req.body.member_company
            req.session.myState = req.body.member_state
            req.session.myPhone = req.body.member_phone
            console.log(req.session.myName)
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
            res.status(400).json({ err: '1', Contents: "옳지 않은 값임" })
          }
        })
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.status(400).json({ err: '2', Contents: "db 연결 실패"})
      }

    })

  } else {
    res.status(400).json({ err: '3', contents: '전화번호나 이메일이 형식에 맞지 않습니다.' })
  }
})


// //이메일 중복확인 및 인증url보내기
//페이지는 인증을 발송했습니다 출력
app.post('/joinAuth', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {

      //인증키 여러번 보냈는지 쿼리
      connection.query("SELECT * FROM ideapf.email_auth WHERE rec_email =" + "'" + req.body.rec_email + "'" + " and email_auth_flag = '0'and email_dispose = '0'", function (err, results) {

        if (!err) {
          //인증키 여러번 보냈는지 확인
          if (results[0] == null) {
            //이미 가입한 이메일인지 쿼리
            connection.query("SELECT member_email FROM member WHERE member_email = " + "'" + req.body.rec_email + "' and member_secede = " + 0, function (err, result, fields) {

              if (!err) {
                //이미 가입한 이메일인지 확인
                if (result[0] == null) {
                  var ran = Math.random().toString(36).substr(2, 8);
                  var et = new Date();
                  //이메일 인증 테이블에 넣기
                  var sql = "INSERT INTO email_auth (email_key, email_date, rec_email) VALUE(?,now(),?)"
                  // var param = [ran, emDate, req.body.rec_email]
                  var param = [ran, req.body.rec_email]
                  connection.query(sql, param, async function (err, results) {
                    if (!err) {
                      var a = await func.SendCheckEmail(req.body.rec_email, ran, 1)
                      if (a == 'ok') {

                        console.log("DB Connection Succeeded이메일 테이블")
                        connection.release();
                        res.status(200).json({ joinAuth: 'ok' })

                      } else {
                        console.log("SendCheckEmail에러")
                        connection.release();
                        res.status(424).json({ err: '4', contents: '이메일 발송 실패' })
                      }

                    } else {
                      console.log(err)
                      console.log("DB Connection Failed이메일 테이블")
                      connection.release();
                      res.status(400).json({ err: '1', contents: '잘못된 값임' })

                    }
                  })
                } else {
                  console.log('중복됨')
                  connection.release();
                  res.status(401).json({ err: '3', contents: '아이디가 중복됨' })
                }
                
              } else {
                console.log("DB Connection Failed중복확인")
                connection.release();
                res.status(400).json({ err: '1', contents: '잘못된 값임' })
              }

            })
            console.log("리솔트가 널 : " + results)

          } else {
            console.log("리솔트 : " + results)
            console.log("인증키 두번누름")
            connection.release();
            res.status(401).json({  err: '3', contents: '인증키 중복됨' })
          }
        } else {
          console.log('err' + err)
          console.log("인증키 두번누름 부분 에러")
          connection.release();
          res.status(400).json({ err: '1', contents: '잘못된 값임' })
        }
      })
    } else {
      console.log('풀에러: ' + err)
      connection.release();
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    }

    
  })

})

// //이메일 인증 -> 약관동의 페이지로 이동
app.get('/check', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query("SELECT * FROM ideapf.email_auth WHERE email_key = " + "'" + req.query.send + "'", function (err, results, fields) {
        if (err) {
          console.log(err)
        } else {
          console.log('results: ' + results)
          //이메일 인증키가 있다면
          if (results[0].email_key == req.query.send) {
            var ett = new Date();
            var ettt = new Date(results[0].email_date);
            var nowDate = ett.getFullYear() + '-' + (ett.getMonth() + 1) + '-' + (ett.getDate()) + ' ' + (ett.getHours()) + ':' + (ett.getMinutes()) + ':' + (ett.getSeconds());
            var reDate = ettt.getFullYear() + '-' + (ettt.getMonth() + 1) + '-' + (ettt.getDate()) + ' ' + (ettt.getHours()) + ':' + (ettt.getMinutes()) + ':' + (ettt.getSeconds());
            console.log(reDate > nowDate)
            console.log("reDate: " + reDate)
            console.log("nowDate " + nowDate)
            //유효하다면
            if (reDate > nowDate) {
              console.log("ok")
              //인증키가 유효하다면
              if (results[0].email_auth_flag == 0 && results[0].email_dispose == 0) {
                connection.query("UPDATE email_auth SET email_auth_flag = 1, email_dispose = 1 WHERE  email_key_id =" + results[0].email_key_id, function (err, result) {
                  if (err) {
                    console.log(err)
                    connection.release();
                    res.status(401).json({ err: '1', contents: '잘못된 값임' })
                  } else {
                    //res.status().redirect("/join")
                    req.session.idsend = req.query.send
                    connection.release();
                    console.log("리다이렉션.")
                    res.status(200).json({ move: '/member/chosenAgree' })
                  }
                })
              } else {
                connection.release();
                console.log("이미 만료된 번호입니다. 다시 인증하셈")
                res.status(401).json({ err: '3', contents: '이미 만료된 번호입니다. 다시 인증하셈' })
              }
            } else {
              connection.query("UPDATE email_auth SET email_auth_flag = 0, email_dispose = 1 WHERE  email_key_id =" + results[0].email_key_id, function (err, result) {
                if (err) {
                  console.log(err)
                  connection.release();
                  res.status(400).json({ err: '1', contents: '잘못된 값임'})
                } else {
                  //res.status().redirect("/join")
                  req.session.idsend = req.query.send
                  console.log("리다이렉션.")
                  connection.release();
                  res.status(200).json({ move: '/join' })
                }
              })
              console.log("reDate: " + reDate)
              console.log("nowDate: " + nowDate)
              console.log("만료")
            }
          } else {
            console.log("인증실패 테이블에 없음")
            connection.release();
            res.status(401).json({ err: '1', contents: '인증실패 테이블에 없음' })
          }
        }
      })
    } else {
      connection.release();
      res.status(400).json({ err: '2', contents: 'db 연결실패'})
    }
  })
})



//로그인 -> 메인페이지로 이동
app.post('/login', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql =  "SELECT * from member WHERE member_email =? and member_pw =?  and member_secede = 0  and member_ban = 0;"
      var param = [req.body.email, func.Pass(req.body.pw) ]
      
      connection.query(sql,param, function (err, result) {
        if (!err) {
          console.log("22222222")
          if (result[0] != null) {
            
            req.session.myEmail = result[0].member_email
            req.session.myPw = result[0].member_pw
            req.session.myName = result[0].member_name
            req.session.mySex = result[0].member_sex
            req.session.myBirth = result[0].member_birth
            req.session.myCompany = result[0].member_company
            req.session.myState = result[0].member_state
            req.session.myPhone = func.Decrypt(result[0].member_phone)
            console.log(req.session.myName)
            req.session.save(() => {
              console.log("session ok")
            })
        
            var newsql = "update member_log set member_login_lately = now() where member_email = ?;"+
            "INSERT INTO member_login_log(member_email, member_login) VALUE( ?, now());"
            var newparam = [req.session.myEmail, req.session.myEmail,  req.session.myEmail]
            connection.query(newsql,newparam, function (err, result) {
              if(!err){
                
                connection.release();
                res.status(200).json({ move: '/' })
                console.log("로그인 성공")
              }else{
                connection.release();
                res.status(400).json({err: '1', contents: '잘못된 값임' })
                console.log("db err")
              }
            })
          } else {
            console.log("로그인 실패")
            connection.release();
            res.status(401).json({ err: '3', contents: '이메일나 비번 틀림' })
          }
        } else {
          console.log("에러: " + err)
          connection.release();
          res.status(400).json({ err: '1', contents: '잘못된 값임' })
        }
      })
    } else {
     
      console.log("풀에러: " + err)
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    }
  })
})


//로그아웃  -> 메인페이지로 이동
app.get('/logout', (req, res) => {

  req.session.destroy(function (err) {
    console.log("로그아웃");
    res.status(200).json({ move: '/' })
  });
})

//약관동의 -> 회원가입페이지로 이동
app.get('/chosenAgree', (req, res) => {


  if (req.query.chose == 1) {
    req.session.chosenAgree = 1
    console.log('약관동의: ' + req.session.cookie._expires)
    res.status(200).json({ move: '/member/join'})
  } else {
    req.session.chosenAgree = 0
    console.log(req.session.chosenAgree)
    res.status(200).json({ move: '/member/join'})
  }

})



//비밀번호 찾기 -> 이메일로 보냈습니다. 출력
app.post('/findPw', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      //인증키 여러번 보냈는지 쿼리
      connection.query("SELECT * FROM pw_find WHERE member_email =" + "'" + req.body.pw_email + "'" + " and pw_edit = '0'and pw_dispose = '0'", async function (err, results) {
        if (!err) {
          //인증키 여러번 보냈는지 확인
          if (results[0] == null) {
            //가입한 이메일인지 쿼리
            await connection.query("SELECT member_email FROM member WHERE member_email = " + "'" + req.body.pw_email + "' and member_secede = " + 0, function (err, result, fields) {
              if (!err) {
                //가입한 이메일인지 확인
                if (result[0].member_email == req.body.pw_email) {
                  console.log(result[0].member_email)
                  console.log(req.body.pw_email)
                  var pt = new Date();
                  //비번 인증 테이블에 넣기
                  var ran = Math.random().toString(36).substr(2, 8);
                  var pwDate = pt.getFullYear() + '-' + (pt.getMonth() + 1) + '-' + (pt.getDate()) + ' ' + (pt.getHours()) + ':' + (pt.getMinutes()) + ':' + (pt.getSeconds());
                  var sql = "INSERT INTO pw_find (pw_key, pw_date, member_email) VALUE(?,?,?)"
                  var param = [ran, pwDate, req.body.pw_email]
                  console.log("paramL " + param)
                  connection.query(sql, param, async function (err, result) {
                    if (!err) {
                      await func.SendCheckEmail(req.body.pw_email, ran, 0)
                      connection.release();
                      console.log("DB Connection Succeeded 비번 테이블")
                      res.status(200).json({ findPw: " ok" })
                    } else {
                      connection.release();
                      console.log("에러")
                      res.status(400).json({ err: '1', contents: '잘못된 값임' })
                    }
                  })
                } else {
                  connection.release();
                  console.log('아이디가 없음')
                  res.status(401).json({ err: '3', contents: '없는 이메일' })
                }
                
              } else {
                connection.release();
                console.log("DB Connection Failed중복확인")
                res.status(400).json({err: '1', contents: '잘못된 값임' })
              }
            })
            console.log("리솔트가 널 : " + results)
            //비밀번호 인증키 테이블에 넣기
          } else {
            connection.release();
            console.log("리솔트 : " + results)
            console.log("인증키 두번누름")
            res.status(401).json({err: '1', contents: '이미 인증키 발송' })
          }
        } else {
          connection.release();
          console.log('err' + err)
          console.log("인증키 두번누름 부분 에러")
          res.status(401).json({ err: '1', contents: '잘못된 값임' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })
})

//비밀번호 인증 
app.get('/checkPw', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query("SELECT * FROM pw_find WHERE pw_key = " + "'" + req.query.send + "'", function (err, results, fields) {
        if (err) {
          console.log(err)
          res.status(400).json({ err: '1', contents: '잘못된 값임' })
        } else {
          console.log('results: ' + results)
          //비밀번호 인증키가 있다면
          if (results[0].pw_key == req.query.send) {
            //인증키가 유효하다면
            if (results[0].pw_edit == 0 && results[0].pw_dispose == 0) {
              //res.status().redirect("/resetpw")
              req.session.pwSend = req.query.send
              connection.release();
              console.log("리다이렉션.")
              res.status(200).json({ move: "/member/resetPw" })
              //res.status().redirect('/')
            } else {
              connection.release();
              console.log("이미 만료된 번호입니다. 다시 인증하셈")
              res.status(401).json({ err: '3', contents: '이미 만료된 번호' })
            }
          } else {
            connection.release();
            console.log("인증실패 테이블에 없음")
            res.status(401).json({ err: '3', contents: '인증실패 테이블에 없음' })
          }
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({err: '2', contents: 'db 연결실패'})
    }
  })

})


//비밀번호 재설정 -> 마이페이지로 이동
app.patch('/resetPw', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {
      b
      var sql = "UPDATE member SET member_pw = ? WHERE member_email IN (select member_email from pw_find where pw_key = ?)"
      var param = [func.Pass(req.body.reset_pw), req.session.pwSend]
      console.log('req.body.reset_pw: ' + req.body.reset_pw)
      console.log(' req.session.pwSend: ' + req.session.pwSend)
      connection.query(sql, param, function (err) {
        if (!err) {
          connection.query("UPDATE pw_find SET pw_edit = 1, pw_dispose = 1 WHERE  pw_key= '" + req.session.pwSend + "'", function (err, result) {
            if (!err) {
              connection.release();
              console.log('성공!')
              res.status(200).json({ move: "/member/mypage" })
            } else {
              connection.release();
              console.log(err)
              res.status(400).json({ err: '1', contents: '잘못된 값임' })
            }
          })
        } else {
          connection.release();
          console.log("실패")
          res.status(400).json({ err: '1', contents: '잘못된 값임' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    }
  })
})

//회원탈퇴 ->메인으로 이동
app.patch('/secede', func.ChkSession, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query("UPDATE member SET member_secede = 1 WHERE  member_email= '" + req.session.myEmail + "'", function (err, result) {
        if (!err) {
          req.session.destroy(function (err) {
            if (!err) {
              connection.release();
              console.log("회원탈퇴");
              res.status(200).json({ move: "/" })
            } else {
              connection.release();
              console.log("세션에러", err);
              res.status(406).json({err: '5', contents: '세션 에러', move: "/" })
            }
          });
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({ err: '1', contents: '잘못된 값임' })
        }
      })
    } else {
      connection.release();
      console.log('풀 에러')
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })
})

//개인정보수정 전 비밀번호 확인 -> 수정페이지로 이동
app.post('/checkPw', func.ChkSession, (req, res) => {
  if (req.session.myPw == func.Pass(req.body.pw)) {
    console.log(req.session)
    res.status(200).json({
      move: '/member/revise',
      member_email: req.session.myEmail,
      member_name: req.session.myName,
      member_sex: req.session.mySex,
      member_birth: req.session.myBirth,
      member_company: req.session.myCompany,
      member_state: req.session.myState,
      member_phone: req.session.myPhone
    })
  } else {
    console.log('실패')
    res.status(401).json({err: '3', contents: '비밀번호 틀림'})
  }

})

//개인정보 수정 -> 마이페이지로 이동
//비번을 제외한 다른 요소의 공백은 프론트에서 확인
app.patch('/revise', func.ChkSession, (req, res) => {

  //전화번호가 형식에 맞다면
  if (realPhone.test(req.body.member_phone) == true) {

    pool.getConnection(function (err, connection) {
      if (!err) {
        console.log('req.body.member_pw: ' + req.body.member_pw)
        //비번이 공백이라면 비번 제외 업데이트
        if (req.body.member_pw == "") {
          var sql = "UPDATE member SET member_name = ?, member_sex = ?, member_birth = ?, member_company = ?, member_state = ?, member_phone= ? WHERE member_email = ?"
          var param = [req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, func.Encrypt(req.body.member_phone), req.session.myEmail]

          connection.query(sql, param, function (err, rows) {
            if (!err) {
              connection.release();
              console.log("DB Connection Succeeded")
              res.status(200).json({ move: "/member/move" })

            } else {
              connection.release();
              console.log("DB Connection Failed")
              res.status(400).json({ err: '1', contents: '잘못된 값' })
              console.log(err)
            }
          })
          //비번이 공백아니라면 비번 포함 업데이트
        } else {
          var sql = "UPDATE member SET member_name = ?, member_pw = ?, member_sex = ?, member_birth = ?, member_company = ?, member_state = ?, member_phone= ? WHERE member_email = ?"
          var param = [req.body.member_name, Pass(req.body.member_pw), req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, func.Encrypt(req.body.member_phone), req.session.myEmail]

          connection.query(sql, param, function (err, rows) {
            if (!err) {
              connection.release();
              console.log("DB Connection Succeeded pw")
              res.status(200).json({ move: "/member/move"  })

            } else {
              connection.release();
              console.log("DB Connection Failed")
              res.status(400).json({err: '1', contents: '잘못된 값' })
              console.log(err)
            }
          })
        }
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결 실패' })
      }

    })
  } else {
    console.log("전화번호가 형식에 맞지않음")
    res.status(401).json({ err: '3', contents: '전화번호가 형식에 맞지않음' })
  }

})


//포인트 현황, 랭크까지 
app.get('/myPoint', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    } else {
      connection.query("select member_rank, use_point, save_point, member_point from member where member_email = ? ", req.session.myEmail, function (err, result) {

        if (err) {
          res.status(400).json({ err: '1', contents: '잘못된 값' })
        } else {
          res.status(200).json({
           
            member_rank: result[0].member_rank,
            use_point: result[0].use_point,
            save_point: result[0].save_point,
            member_point: result[0].member_point,
          })
        }
      })
    }
  })
})




//포인트 사용하기 
app.get('/usePoint', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    } else {
      var sql = "UPDATE member SET member_point =  member_point-1000 , use_point =  use_point + 1000 WHERE member_email = ?;"+
      "INSERT INTO ideapf.point(member_email, use_date, use_contents) VALUE (? , now() , '상품권 1만원');"
      var param = [req.session.myEmail,req.session.myEmail]
      connection.query(sql, param, function (err, result) {

        if (err) {
          res.status(400).json({  err: '3', contents: '잘못된 값' })
        } else {
          res.status(200).json({
            usePoint: 'ok'
            
          })
        }
      })
    }
  })
})

//포인트 사용내역
app.get('/usePointLog', func.ChkSession, (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    } else {
      var sql = "SELECT count(use_contents) as num FROM ideapf.point WHERE member_email = ?"
      var param = [req.session.myEmail]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          if(postNum != 0){
            var sql = "SELECT use_date, use_contents FROM ideapf.point WHERE member_email = ? limit ?,?"
            var param = [req.session.myEmail,limit, pageNum]
            connection.query(sql, param, function (err, result) {
              
              if (err) {
                res.status(400).json({ err: '1', contents: '잘못된 값' })
              } else {
                res.status(200).json({
                  usePoint: result,
                  postNum: postNum
                  
                })
              }
            })
          }else{
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          }
            
            
          
        } else {
          connection.release();
          res.status(400).json({ err: '1', contents: '잘못된 값'})
        }
      })
        
    }
  })
})


//누적 내역

app.get('/savePointLog', func.ChkSession, (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    } else {
      var sql = "SELECT count(idea_id) as num FROM idea WHERE member_email = ? and idea_delete = 0 and add_point > 0"
      var param = [req.session.myEmail]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          if(postNum !=0){
            var sql = "SELECT idea_id, idea_date, idea_title  FROM idea WHERE member_email = ? and idea_delete = 0 and add_point > 0 limit ?,?"
            var param = [req.session.myEmail,limit,pageNum]
            connection.query(sql,param,function(err, result){
              if(err){ res.status(400).json({ err: '1', contents: '잘못된 값' })}
              res.status(200).json({ result: result,
                        postNum: postNum
            })
            })
          }else{
            res.status(400).json({ result: 'empty' })
          }
            
          
        } else {
          res.status(400).json({ err: '1', contents: '잘못된 값' })
        }
      })
    }
  })
})


//내 아이디어 
app.get('/myIdea', func.ChkSession, (req, res) => {


  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  pool.getConnection(function (err, connection) {
    if (!err) {
      //게시물 개수
      connection.query("SELECT count(idea_id) as num FROM idea WHERE member_email = ? and idea_delete = 0 ", req.session.myEmail, function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          if (postNum != 0) {
            //내 아이디어 가져오기
            var sql = "SELECT idea_id, idea_title, idea_date FROM idea WHERE member_email = ? and idea_delete = 0 ORDER BY idea_id DESC limit ?, ?"
            var param = [req.session.myEmail, limit, pageNum]
            connection.query(sql, param, function (err, result) {

              if (!err) {
                connection.release();
                res.status(200).json({
                  result: result,
                  postNum: postNum
                })
              } else {
                connection.release();
                console.log("에러:" + err)
                res.status(400).json({ err: '1', contents: '잘못된 값' })
              }
            })
          } else {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          }

        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({  err: '1', contents: '잘못된 값'})
        }


      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({  err: '3', contents: 'db 연결실패' })

    }

  })
})


//내 아이디어 상세보기
app.get('/myIdea/deTail', func.ChkSession, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT idea_id, idea_title, idea_date ,idea_contents, member_email FROM idea WHERE idea_id = ?;" + "SELECT idea_file_name FROM idea_file_dir WHERE idea_id = ?;"
      var param = [req.query.send,req.query.send]
      connection.query(sql, param, function (err, result) {

         if(result[0].member_email = req.session.myEmail || req.session.adMyEmail != null){
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
          
        }else{
          connection.release();
            console.log("본인 아이디 아님" )
            res.status(400).json({  err: '3', contents: '본인 아이디 아님' })
        }
        
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({   err: '2', contents: 'db 연결실패' })
    }

  })
})



//내 아이디어 등록하기 -> 내 아이디어 페이지로 이동
app.post('/myIdea/ideaPush', func.ChkSession, upload.array('sendImg'), (req, res) => {

  console.log(req.files);
  if (req.files[0] == null) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        var sql = "INSERT INTO idea(idea_title, idea_contents, idea_date,member_email, add_point) VALUE (?,?,curdate(),?,500);" +
        "INSERT INTO idea_log(idea_id, idea_edit_date, idea_contents) VALUE((SELECT MAX(idea_id) FROM idea WHERE member_email =? and idea_title = ?),now(),?);" +
        "UPDATE member SET member_point = member_point +500 , save_point = save_point + 500 WHERE member_email = ?;"
        var param = [ req.body.title, req.body.contents, req.session.myEmail, req.session.myEmail,  req.body.title, req.body.contents, req.session.myEmail]
        connection.query(sql, param, function (err, result) {
          if (!err) {
            connection.release();
            console.log("성공")
            res.status(200).json({ notice: "ok", move: '/myIdea' })
          } else {
            connection.release();
            console.log(req.body.title)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    pool.getConnection(function (err, connection) {
      if (!err) {
        var sql = "INSERT INTO idea(idea_title, idea_contents, idea_date,member_email, add_point) VALUE (?,?,curdate(),?,500);" +
        "INSERT INTO idea_log(idea_id, idea_edit_date, idea_contents) VALUE((SELECT MAX(idea_id) FROM idea WHERE member_email =? and idea_title = ?),now(),?);" +
        "UPDATE member SET member_point = member_point +500 , save_point = save_point + 500 WHERE member_email = ?;"
        var param = [ req.body.title, req.body.contents, req.session.myEmail, req.session.myEmail,  req.body.title, req.body.contents, req.session.myEmail]

        connection.query(sql, param, function (err, result) {
          if (!err) {
            var i = 1
            var newsql = "INSERT INTO idea_file_dir(idea_file_name, idea_file_path, idea_id ) VALUE(?,?,(select MAX(idea_id) FROM idea WHERE member_email=? ));"
            var ex = [req.files[0].originalname, req.files[0].path, req.session.myEmail]
            while (req.files[i] != null) {
              newsql = newsql + "INSERT INTO idea_file_dir(idea_file_name, idea_file_path, idea_id ) VALUE(?,?,(select MAX(idea_id) FROM idea WHERE member_email=? ));"
              ex = ex.concat(req.files[i].originalname, req.files[i].path, req.session.myEmail)
              i++
            }
            param = ex

            connection.query(newsql, param, function (err, result) {
              if (!err) {
                connection.release();
                res.status(200).json({ notice: "ok", move: '/myIdea' })

              } else {
                connection.release();
                console.log(err)
                res.status(400).json({ err: '1', contents: '잘못된 값'})
              }

            })



          } else {
            connection.release();
            console.log(req.body.title)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }

        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  }


})



//내 아이디어 수정 -> 내 아이디어 페이지로 이동
app.patch('/myIdea/ideaReset', func.ChkSession, upload.array('sendImg'), (req, res) => {
 

//파일 삭제 -> 업데이트
  
  
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        var sql =  "select *  FROM idea_file_dir WHERE idea_id=?;"
        var param = [req.body.idea_id]
        connection.query(sql, param, function (err, result) {
          if (!err) {
            console.log(" result[i].idea_file_path: "+ result[0].idea_file_path)
            
            var i = 0
            while(result[i]!=null){
              
              
              fs.unlink("./"+ result[i].idea_file_path, function(err){
                if( err ) {  console.log(err)}
                console.log('file delete');
                
              });
              console.log("성공")
              i++
            }
            
            var sql = "UPDATE idea_log SET idea_edit_date = now(), idea_contents = (SELECT idea_contents from idea WHERE idea_id = ?) WHERE idea_id = ?;" +
                  "UPDATE idea SET idea_title = ? , idea_contents = ? WHERE idea_id = ?;" + "UPDATE idea_file_dir SET idea_file_name=?,idea_file_path=? WHERE idea_id = ?;"
                var param = [ req.body.idea_id, req.body.idea_id, req.body.idea_title, req.body.idea_contents, req.body.idea_id, req.files[0].originalname, req.files[0].path, req.body.idea_id]
                connection.query(sql, param, function (err, result) {
                  if(!err){
                    
                    res.status(200).json({result:"ok", move: '/myIdea'})
                    connection.release();
                  }else{
                    
                    res.status(400).json({err: '1', contents: '잘못된 값'})
                    connection.release();
                  }
                })
          } else {
            connection.release();
            
            res.status(400).json({err: '1', contents: '잘못된 값' })
          }
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({err: '2', contents: 'db 연결실패' })
      }
    })
  

})

//내 아이디어 검색 검색 정규식 필요, fulltext 설정해야함
app.get('/myIdea/search', func.ChkSession, (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if(func.checkSpace(req.query.send)){

    
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        console.log("req.query.send:" + req.query.send)
        //게시물 찾기
        var sql = "select idea_id, idea_title, idea_date from idea where member_email = ? and match(idea_title) against(? IN boolean mode) ORDER BY idea_id DESC limit ?,?;"
        var param = [req.session.myEmail, req.query.send +'*', limit, pageNum]
        connection.query(sql, param, function (err, result) {
          if(!err){
            
            if(result[0]==null){
              
              connection.release();
              res.status(400).json({ result: "empty" })
            }else{
              var newResult = result
              
              //게시물 개수
              var sql = "select count(idea_id) as num  from idea where member_email = ? and match(idea_title) against(? IN boolean mode)"
            var param = [req.session.myEmail,  req.query.send+'*']
            connection.query(sql, param, function (err, result) {
              if (!err) {
                var postNum = func.checkPage(result[0].num)
                console.log("result[0].num:"+result[0].num)
                connection.release();
                console.log("result:" + newResult)
                res.status(200).json({ result: newResult,
                  postNum: postNum
                })
                
              } else {
                connection.release();
                console.log(err)
                res.status(400).json({ err: '1', contents: '잘못된 값' })
              }
              
            })
          }
          }else{
            connection.release();
            console.log(err)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }
          
          
        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  }else{
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
  })
  

  //내 아이디어 다운로드
app.get('/myIdea/download', function (req, res) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  * from idea_file_dir  where idea_id = ? and idea_file_name = ?;"
      var param = [req.query.send, req.query.name]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          if (result[0] != null) {

            var filePath = result[0].idea_file_path
            res.status(200).download(filePath)
          } else {

            console.log("에러:" + err)
            res.status(400).json({ err: '1', contents: '잘못된 값' })
          }

        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패'})
    }
  })

})
  
  
  //관심사업 
app.get('/myInter', func.ChkSession, (req, res) => {

  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  pool.getConnection(function (err, connection) {
    if (!err) {
      //관심사업 개수
      connection.query("SELECT count(anno_id) as num FROM inter_anno WHERE member_email = ?", req.session.myEmail, function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          if (postNum != 0) {
            //관심사업 목록
            var sql = "SELECT anno_title, anno_date, inter_anno.anno_id from anno inner JOIN inter_anno on inter_anno.member_email= ? and anno.anno_id =  inter_anno.anno_id ORDER BY anno.anno_id DESC limit ?,?;"
            var param = [req.session.myEmail,limit,pageNum]
            connection.query(sql, param, function (err, result) {
              if(!err){
                connection.release();
            console.log("result:" + 0)
            res.status(200).json({ myInter : result ,
                      postNum: postNum
                     })
              }else{
                connection.release();
            console.log("myInter err")
            res.status(400).json({err: '1', contents: '잘못된 값' })
              }
            })
          } else {
            connection.release();
            console.log("result:" + 0)
            res.status(400).json({ result: "empty" })
          }
        } else {
          connection.release();
          console.log("db 에러")
          res.status(400).json({ err: '1', contents: '잘못된 값'})
        }
      })

    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    }
  })
})

//관심사업 상세보기
app.get('/myInter/deTail', func.ChkSession, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT * FROM anno WHERE anno_id = ?"
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
          res.status(400).json({ err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패'})
    }
  })
})

//관심사업 검색 , 공백 검색 정규식 필요, get 공백은 0
app.get('/myInter/search', func.ChkSession, (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  
  if(func.checkSpace(req.query.send)){

    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 찾기
        
        var sql = "SELECT  inter_anno.anno_id, anno.anno_title, anno.anno_date from anno inner JOIN inter_anno on inter_anno.member_email= ? and anno.anno_id =  inter_anno.anno_id where match(anno_title) against( ? IN boolean mode) anno.anno_id  limit ?,?;"
        var param = [req.session.myEmail,  req.query.send + '*', limit, pageNum]
        connection.query(sql, param, function (err, result) {
          if(!err){
            if(result[0]==null){
              
              connection.release();
              console.log("result:" + 0)
              res.status(400).json({ result: "empty" })
            }else{
              
              var newResult = result
            
              //게시물 개수
              var sql = "SELECT  count(inter_anno.anno_id) as num from anno inner JOIN inter_anno on inter_anno.member_email= ? and anno.anno_id =  inter_anno.anno_id where match(anno_title) against( ? IN boolean mode);"
              var param = [req.session.myEmail,  req.query.send + '*']
              connection.query(sql, param, function (err, result) {
                if (!err) {
                  var postNum = func.checkPage(result[0].num)
                  console.log("result[0].num:"+result[0].num)
                  
                  
                  connection.release();
                  console.log("result:" + newResult)
                  res.status(200).json({ result: newResult,
                    postNum: postNum
                  })
                  
                  
                  
                  
                } else {
                  connection.release();
                  console.log(err)
                  res.status(400).json({ err: '1', contents: '잘못된 값' })
                }
                
              })
            }
              
            }else{
              connection.release();
              console.log(err)
              res.status(400).json({ err: '1', contents: '잘못된 값' })
            }
            
            
          })
        
        
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  }else{
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
  })
  
  
  
  module.exports = app
  
