//인증시간 만료시간 백그라운드에서 말고 인증할때 확인하고 바꾸는 것으로
//**나중에 res.send 프론트에 맞게 설정하기**
// import {connection} from "mysql.js"
/* 계층팀장에게 물어보자
*myapp에 commom에 func, config에 db,session넣기 
*/

const express = require('express')
const app = express()
app.use(express.json())
require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js')//함수
let session = sess.session

app.use(session)

const realPhone = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호 정규식
const realEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식


//시간
var moment = require('moment');
const { now } = require('moment')
const { route } = require('.')
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");



//**나중에 res.send 프론트에 맞게 설정하기**
//pool로 바꾸기


//회원가입, 로그 db에 등록하기
app.post('/join', (req, res) => {


  if (realPhone.test(req.body.member_phone) == true && realEmail.test(req.body.member_email) == true) {//전화번호 정규식

    
    pool.getConnection(async function (err, connection) {
      if (!err) {
        
        
        var joinlog = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(joinlog)
        var sql = "INSERT INTO ideapf.member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree, member_rank) VALUE(?,?,?,?,?,?,?,?,?,?);" +
        "INSERT INTO member_login_log (member_email,member_login) VALUE(?,?);" +
        "INSERT INTO member_log (member_email,member_log_join,member_login_lately) VALUE(?,?,?);"
        var param = [req.body.member_email, req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, func.Pass(req.body.member_pw), func.Encrypt(req.body.member_phone), req.session.chosenAgree,await func.RankCheck(), req.body.member_email, joinlog, req.body.member_email, joinlog, joinlog,]
        connection.query(sql, param, function (err, rows, fields) {
          if (!err) {
            console.log('성공')
            console.log("DB Connection Succeeded")
            connection.release();
            res.send('DB Connection Succeeded')

          } else {
            console.log("DB Connection Failed")

            console.log(err)

            connection.release();
            res.send('DB Connection Failed')
          }
        })
      } else {
        console.log('풀에러: ' + err)
        connection.release();
        res.send('로그인')
      }

    })

  } else {
    res.send('전화번호나 이메일이 형식에 맞지 않습니다.')
  }
})


// //이메일 중복확인 및 인증url보내기
//페이지는 인증은 발송했습니다 출력
app.post('/joinAuth', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {

      //인증키 여러번 보냈는지 쿼리
      connection.query("SELECT * FROM ideapf.email_auth WHERE rec_email =" + "'" + req.body.rec_email + "'" + " and email_auth_flag = '0'and email_dispose = '0'",  function (err, results) {

        if (!err) {
          //인증키 여러번 보냈는지 확인
          if (results[0] == null) {
            //이미 가입한 이메일인지 쿼리
            connection.query("SELECT member_email FROM member WHERE member_email = " + "'" + req.body.rec_email + "' and member_secede = " + 0,  function (err, result, fields) {

              if (!err) {
                //이미 가입한 이메일인지 확인
                if (result[0] == null) {
                  var ran = Math.random().toString(36).substr(2, 8);
                  var et = new Date();
                  //이메일 인증 테이블에 넣기
                  var emDate = et.getFullYear() + '-' + (et.getMonth() + 1) + '-' + (et.getDate()) + ' ' + (et.getHours()) + ':' + (et.getMinutes() + 15) + ':' + (et.getSeconds());
                  var sql = "INSERT INTO email_auth (email_key, email_date, rec_email) VALUE(?,now(),?)"
                  // var param = [ran, emDate, req.body.rec_email]
                  var param = [ran,  req.body.rec_email]
                  connection.query(sql, param, async function (err, results) {
                    if (!err) {
                      var a = await func.SendCheckEmail(req.body.rec_email, ran, 1)
                      if( a == 'ok'){

                        console.log("DB Connection Succeeded이메일 테이블")
                        connection.release();
                        res.send('DB Connection Succeeded이메일 테이블')

                      }else{
                        console.log("SendCheckEmail에러")
                        connection.release();
                        res.send('SendCheckEmail에러')
                      }

                    } else {
                      console.log(err)
                      console.log("DB Connection Failed이메일 테이블")
                      connection.release();
                      res.send('DB Connection Failed이메일 테이블')

                    }
                  })
                } else {
                  console.log('중복됨')
                  connection.release();
                  res.send('중복됨')
                }

                console.log("DB Connection Succeeded중복확인")

              } else {
                console.log("DB Connection Failed중복확인")
                connection.release();
                res.send('DB Connection Failed중복확인')
              }

            })
            console.log("리솔트가 널 : " + results)

          } else {
            console.log("리솔트 : " + results)
            console.log("인증키 두번누름")
            connection.release();
            res.send('인증키 두번누름')
          }
        } else {
          console.log('err' + err)
          console.log("인증키 두번누름 부분 에러")
          connection.release();
          res.send('인증키 두번누름 부분 에러')
        }
      })
    } else {
      console.log('풀에러: ' + err)
      connection.release();
      res.send('로그인')
    }

  })

})

// //이메일 인증 

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
                    res.send('에러!')
                  } else {
                    //res.redirect("/join")
                    req.session.idsend = req.query.send
                    connection.release();
                    console.log("리다이렉션.")
                    res.send('리다이렉션')
                  }
                })

              } else {
                connection.release();
                console.log("이미 만료된 번호입니다. 다시 인증하셈")
                res.send('이미 만료된 번호입니다. 다시 인증하셈')
              }


            } else {


              connection.query("UPDATE email_auth SET email_auth_flag = 0, email_dispose = 1 WHERE  email_key_id =" + results[0].email_key_id, function (err, result) {
                if (err) {
                  console.log(err)
                  connection.release();
                  res.send('에러!')
                } else {
                  //res.redirect("/join")
                  req.session.idsend = req.query.send
                  console.log("리다이렉션.")
                  connection.release();
                  res.send('리다이렉션')
                }
              })

              console.log("reDate: " + reDate)
              console.log("nowDate: " + nowDate)
              console.log("만료")

            }


          } else {
            console.log("인증실패 테이블에 없음")
            connection.release();
            res.send('인증실패 테이블에 없음')
          }
        }
      })
    } else {
      connection.release();
      res.send('풀에러')
    }

  })

})



//로그인
//체크

app.post('/login', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {


      connection.query("SELECT * from member WHERE member_email = '" + req.body.email + "'and member_pw = '" + func.Pass(req.body.pw) + "' and member_secede = " + 0 + " and member_ban = " + 0, function (err, result) {
        if (!err) {

          if (result[0] != null) {

            req.session.myEmail = result[0].member_email
            req.session.myPw = result[0].member_pw
            req.session.myName = result[0].member_name
            console.log(req.session.myName)
            req.session.save(() => {
              console.log("리다이렉션")
              res.json({login: 'ok'})
              //res.send('로그인')
              // res.redirect('/');
            })

            connection.release();
            console.log("로그인 성공")

          } else {
            console.log("로그인 실패")
            connection.release();
            res.json({login: 'fail'})
          }
        } else {
          console.log("에러: " + err)
          connection.release();
          res.json({db: 'err'})
        }
      })

    } else {
      connection.release();
      console.log("풀에러: " + err)
      res.json({pool: 'err'})
    }
  })
})


//로그아웃 

app.get('/logout', (req, res) => {

  req.session.destroy(function (err) {
    console.log("로그아웃");
    res.json({logout: 'ok'})
  });


})

//약관동의
app.get('/chosenAgree', (req, res) => {


  if (req.query.chose == 1) {
    req.session.chosenAgree = 1
    console.log('약관동의: ' + req.session.cookie._expires)
    res.json({chosenAgree: req.query.chose})


  } else {
    req.session.chosenAgree = 0
    console.log(req.session.chosenAgree)
    res.json({chosenAgree: req.query.chose})
  }

})

// app.get('/test', (req, res) => {

//   console.log( req.session.cookie._expires )

//   console.log( moment( req.session.cookie._expires ).format(), moment().format() )

//   if ( new Date( req.session.cookie._expires ) < new Date() ) {

//     console.log( '만료' )

//     return res.send( '만료' )
//   }

//   console.log( '유효' )

//   return res.send( '유효' )

//   // res.send('테스트')
// })

// //창 닫을 시 꺼지게 하기 클라측
// // $(window).unload(function () { 
// //   $.get('/session/destroy');
// // });


// //창 닫을 시 꺼지게 하기 서버측
// // app.get('/session/destroy', function(req, res) {
// //   req.session.destroy();
// //   res.status(200).send('ok');
// // });


//비밀번호 찾기
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

                  var ran = Math.random().toString(36).substr(2, 8);
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
                      res.json({findPw:" Succeeded"})
                    } else {
                      connection.release();
                      console.log("에러")
                      res.json({db:" err"})
                    }
                  })
                } else {
                  connection.release();
                  console.log('아이디가 없음')
                  res.json({email:"empty"})
                }

                console.log("DB Connection Succeeded 아이디 확인")




              } else {
                connection.release();
                console.log("DB Connection Failed중복확인")
               
                res.json({db:"DB Connection Failed 중복확인"})
              }

            })
            console.log("리솔트가 널 : " + results)


            //비밀번호 인증키 테이블에 넣기
          } else {
            connection.release();
            console.log("리솔트 : " + results)
            console.log("인증키 두번누름")
            res.json({db:"인증키 두번누름"}) 
            

          }
        } else {
          connection.release();
          console.log('err' + err)
          console.log("인증키 두번누름 부분 에러")
          res.json({db:"인증키 두번누름 err"}) 
        }
      })
    } else {

      connection.release();
      console.log("풀 에러")
      res.json({pool:"err"}) 
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
          res.json({db:"err"}) 
        } else {
          console.log('results: ' + results)
          //비밀번호 인증키가 있다면
          if (results[0].pw_key == req.query.send) {

            //인증키가 유효하다면
            if (results[0].pw_edit == 0 && results[0].pw_dispose == 0) {
              //res.redirect("/resetpw")
              req.session.pwSend = req.query.send
              connection.release();
              console.log("리다이렉션.")
              res.json({checkPw:"ok"}) 
              //res.redirect('/')

            } else {
              connection.release();
              console.log("이미 만료된 번호입니다. 다시 인증하셈")
              res.send('이미 만료된 번호입니다. 다시 인증하셈')
              res.json({checkPw:"이미 만료된 번호입니다. 다시 인증하셈"})
            }

          } else {
            connection.release();
            console.log("인증실패 테이블에 없음")
            res.json({checkPw:"fail"}) 
            
          }
        }
      })

    } else {
      connection.release();
      console.log("풀 에러")
      res.json({pool:"err"}) 
    }
  })

})


//비밀번호 재설정
app.patch('/resetPw', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {


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
              res.json({resetPw:"ok"}) 
            } else {
              connection.release();
              console.log(err)
              res.json({resetPw:"err"}) 
            }
          })


        } else {
          connection.release();
          console.log("실패")
          res.json({db:"err"}) 
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({pool:"err"}) 

    }

  })

})

//회원탈퇴

app.patch('/secede', func.ChkSession, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {


      connection.query("UPDATE member SET member_secede = 1 WHERE  member_email= '" + req.session.myEmail + "'", function (err, result) {
        if (!err) {

          req.session.destroy(function (err) {
            if (!err) {
              connection.release();
              console.log("회원탈퇴");
              res.json({secede:"ok"})
            } else {
              connection.release();
              console.log("세션에러", err);
              res.json({session:"err"})
            }
          });

        } else {
          connection.release();
          console.log(err)
          res.json({db:"err"})
        }
      })
    } else {
      connection.release();
      console.log('풀 에러')
      res.json({pool:"err"})
    }

  })
})

//개인정보수정 전 비밀번호 확인 
app.post('/checkPw', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {


      if (req.session.myPw == func.Pass(req.body.pw)) {
        //다음페이지에 정보들이 미리 써있기 위한 쿼리
        connection.query("SELECT * FROM member WHERE member_email = '" + req.session.myEmail + "'", function (err, result) {
          if (!err) {
            
            console.log(result[0].member_name)
            connection.release();
           //res.send('ok')
            res.json({checkPw:'ok',
            member_email: result[0].member_email,
            member_name: result[0].member_name,
            member_sex: result[0].member_sex,
            
            member_birth: result[0].member_birth,
            member_company: result[0].member_company,
            member_state: result[0].member_state,
            member_phone: func.Decrypt(result[0].member_phone)

            })
            


          } else {
            connection.release();
            console.log("에러: " + err)
            res.json({db:"err"}) 
          }
        })

        console.log("일치")

      } else {
        connection.release();
        console.log("불일치")
        res.json({checkPw:"not same"}) 
      }
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({pool:"err"})

    }

  })
})

//개인정보 수정
//비번을 제외한 다른 요소의 공백은 프론트에서 확인
app.patch('/revise', func.ChkSession, (req, res) => {

  //전화번호가 형식에 맞다면
  if (realPhone.test(req.body.member_phone) == true) {

    pool.getConnection(function (err, connection) {
      if (!err) {
console.log('req.body.member_pw: '+req.body.member_pw)
        //비번이 공백이라면 비번 제외 업데이트
        if (req.body.member_pw == "") {
          var sql = "UPDATE member SET member_name = ?, member_sex = ?, member_birth = ?, member_company = ?, member_state = ?, member_phone= ? WHERE member_email = ?"
          var param = [req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, func.Encrypt(req.body.member_phone), req.session.myEmail]

          connection.query(sql, param, function (err, rows) {
            if (!err) {
              connection.release();
              console.log("DB Connection Succeeded")
              res.json({revise:"ok"})

            } else {
              connection.release();
              console.log("DB Connection Failed")
              res.json({revise_db:"err"})
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
              res.json({revise:"ok"})

            } else {
              connection.release();
              console.log("DB Connection Failed")
              res.json({revise_db:"err"})
              console.log(err)
            }
          })


        }
      } else {
        connection.release();
        console.log("풀 에러")
        res.json({pool:"err"})
      }

    })
  } else {
    console.log("전화번호가 형식에 맞지않음")
    res.json({phone_num:"err"})
  }

})


//포인트 현황
app.get('/myPoint',func.ChkSession,(req,res)=>{

  pool.getConnection(function (err, connection) {
    if(err){res.json({pool: err})
  }else{
    connection.query("select member_rank, use_point, save_point, member_point from member where member_email = ? ", req.session.myEmail,function(err,result){

      if(err){res.json({db: err})
    }else{
      res.json({myPoint: 'ok',
                member_rank:result[0].member_rank,
                use_point:result[0].use_point,
                save_point:result[0].save_point,
                member_point:result[0].member_point,
      })
    }




    })

    }
    





















  })













})









//내 아이디어 <-
app.get('/myIdea', func.ChkSession, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (!err) {


      var sql = "SELECT idea_id, idea_title, idea_date FROM idea WHERE member_email = ? and idea_delete = 0"
      var param = [req.session.myEmail]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          var i = 0
          while (result[i] != null) {
            console.log(result[i])
            //console.log(moment(result[i].idea_date).format())
            console.log(result[i].idea_date)
            i++
          }
          connection.release();
          res.json({myIdea:"ok"})

        } else {
          connection.release();
          console.log("에러:" + err)
          res.json({myIdea:"err"})

        }

      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.json({pool:"err"})
    }

  })
})




module.exports = app

