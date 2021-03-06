
const express = require('express')
const app = express()
app.use(express.json())


require('dotenv').config() //env
let sess = require('../common/session.js')//세션
let pool = require('../common/database.js')//db 
let func = require('../common/func.js');//함수
let upload = require('../common/upload.js');//파일 업로드
var fs = require('fs');
let session = sess.session
app.use(session)
const pageNum = 15


var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");




// app.get('/test', (req, res) => {
//   pool.getConnection(function (err, connection) {
//     if (!err) {
//       var sql = "select * from anno where anno_id=?;"
//       var param = [req.query.send, req.query.send]
//       connection.query(sql, param, function (err, row, fields) {
//         if (!err) {
//           connection.release();
//           console.log("fields: " +fields)
//           console.log("row: " +row)
//           res.json({
//             result: fields,
//             row:row
//           })
//         } else {
//           connection.release();
//           console.log("에러:" + err)
//           res.json({ db: "err" })
//         }
//       })
//     } else {
//       connection.release();
//       console.log("풀 에러")
//       res.json({ pool: "err" })
//     }
//   })

// })





//고객센터 보내기
app.post('/contact',  function (req, res) {
  pool.getConnection(function (err, connection) {
    if (!err) {

      //게시물 
      var sql = "INSERT INTO contact(email, contact_title, contact_contents) VALUE(?,?,?);"+"INSERT INTO contact_log(contact_id, contact_send) VALUE((select MAX(contact_id) from contact where contact_title = ?),now());"
      var param = [req.body.email, req.body.title, req.body.contents,req.body.contents,]
      connection.query(sql,param, function (err, result) {
        if (!err) {
          connection.release();
          console.log(err)
          res.status(200).json({ contact: "ok" })
          
        } else {
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

 

})






//참여자 순위와 목록
app.get('/totalRank', (req, res) => {
 

  pool.getConnection(function (err, connection) {
    if (!err) {

      //게시물 
      var sql = "select member_name,save_point ,member_rank from member where member_rank  BETWEEN 1 AND 10 ORDER BY member_rank ASC;"
      connection.query(sql, function (err, result) {
        if (!err) {
          connection.release();
          console.log(err)
          res.status(200).json({ totalRank: result })
          
        } else {
          connection.release();
          console.log(err)
          res.status(400).json({ err: '1', contents: '잘못된 값'})
        }


      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})




//공고게시판
app.get('/anno', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)


  pool.getConnection(function (err, connection) {
    if (!err) {

      //게시물 
      var sql = "select anno_id, anno_title, anno_date from anno ORDER BY anno_id DESC limit ?,?;" +
        "select count(anno_id) as num from anno;"
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
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})


//공고게시판 상세보기
app.get('/anno/detail', (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "select * from anno where anno_id=?;"
      var param = [req.query.send, req.query.send]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
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

//공고게시판 검색
app.get('/anno/search', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if (func.checkSpace(req.query.send)) {

    pool.getConnection(function (err, connection) {
      if (!err) {

        //게시물 찾기
        var sql = "select anno_id, anno_title, anno_date from anno where  match(anno_title) against(? IN boolean mode) ORDER BY anno_id DESC limit ?,?;" +
          "select count(anno_id) as num from anno where match(anno_title) against(? IN boolean mode)"
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
              res.status(200).json({
                result: result,
                postNum: postNum
              })
            }
          } else {
            connection.release();
            console.log(err)
            res.status(400).json({err: '1', contents: '잘못된 값' })
          }


        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.json({ result: "searchEmpty" })
  }
})

//아이디어게시판
app.get('/idea', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)


  pool.getConnection(function (err, connection) {
    if (!err) {

      //게시물 
      var sql = "select idea_id, idea_title, idea_date from idea WHERE idea_delete = 0 ORDER BY idea_id DESC limit ?,?;" +
        "select count(idea_id) as num from idea  WHERE idea_delete = 0;"
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
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})


//아이디어게시판 검색
app.get('/idea/search', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if (func.checkSpace(req.query.send)) {

    pool.getConnection(function (err, connection) {
      if (!err) {
        //게시물 찾기
        var sql = "select idea_id, idea_title, idea_date from idea where  idea_delete = 0 and  match(idea_title) against(? IN boolean mode) ORDER BY idea_id DESC limit ?,?;"+
        "select count(idea_id) as num from idea where  idea_delete = 0 and  match(idea_title) against(? IN boolean mode)"
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
            res.status(400).json({ err: '1', contents: '잘못된 값'})
          }


        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({ err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
})




//문의게시판
app.get('/cs', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)


  pool.getConnection(function (err, connection) {
    if (!err) {

      //게시물 
      var sql = "select cs_id, cs_title, cs_date , cs_secret from cs where cs_delete = 0 ORDER BY cs_id DESC limit ?,?;" +
        "select count(cs_id) as num from cs where cs_delete = 0 ;"
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
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})


//문의게시판 상세보기 
app.get('/cs/detail', (req, res) => {
  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  cs_file_name from cs left outer join cs_file_dir on cs.cs_id = cs_file_dir.cs_id where cs.cs_id = ?;" +
        "select * from cs where cs_id=?;"
      var param = [req.query.send, req.query.send]
      connection.query(sql, param, function (err, result) {

        if (!err) {
          connection.release();
          res.status(200).json({
            result: result,
            session: req.session.myEmail
          })
        } else {
          connection.release();
          console.log("에러:" + err)
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


//문의게시판 올리기, 한글깨짐
// app.post('/cs/csUpload',func.ChkSession,upload.array('sendImg'),function(req,res){
app.post('/cs/csUpload', upload.array('sendImg'), function (req, res) {
  console.log(req.files);
  if (req.files[0] == null) {
    pool.getConnection(function (err, connection) {
      if (!err) {
        var sql = "INSERT INTO cs( cs_contents, cs_title, cs_date, member_email, cs_secret) VALUE( ?, ?, curdate(),?,?);" +
          "INSERT INTO cs_log(cs_id, cs_edit_date, cs_before_contents ) VALUE((select MAX(cs_id) FROM cs WHERE member_email=? and cs_title = ?), now(),?);"
        var param = [req.body.contents, req.body.title, req.session.myEmail, req.body.secret, req.session.myEmail, req.body.title, req.body.contents]
        connection.query(sql, param, function (err, result) {
          if (!err) {
            connection.release();
            console.log("성공")
            res.status(200).json({ cs: "ok" })
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
        var sql = "INSERT INTO cs( cs_contents, cs_title, cs_date, member_email, cs_secret) VALUE( ?, ?, curdate(),?,?);" +
          "INSERT INTO cs_log(cs_id, cs_edit_date, cs_before_contents ) VALUE((select MAX(cs_id) FROM cs WHERE member_email=? and cs_title = ?), now(),?);"
        var param = [req.body.contents, req.body.title, req.session.myEmail, req.body.secret, req.session.myEmail, req.body.title, req.body.contents]

        connection.query(sql, param, function (err, result) {
          if (!err) {
            var i = 1
            var newsql = "INSERT INTO cs_file_dir(cs_file_name, cs_file_path, cs_id ) VALUE(?,?,(select MAX(cs_id) FROM cs WHERE member_email=? ));"
            var ex = [req.files[0].originalname, req.files[0].path, req.session.myEmail]
            while (req.files[i] != null) {
              newsql = newsql + "INSERT INTO cs_file_dir(cs_file_name, cs_file_path, cs_id ) VALUE(?,?,(select MAX(cs_id) FROM cs WHERE member_email=? ));"
              ex = ex.concat(req.files[i].originalname, req.files[i].path, req.session.myEmail)
              i++
            }
            param = ex

            connection.query(newsql, param, function (err, result) {
              if (!err) {
                connection.release();
                res.status(200).json({ notice: "ok" })

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
        res.status(400).json({ err: '2', contents: 'db 연결실패'})
      }
    })
  }


})

//문의게시판 올리기 직전
app.get('/cs/', func.ChkSession, function (req, res) {
  res.status(200).json({ name: req.session.myName })

})

//문의게시판 수정
app.patch('/cs/reset', func.ChkSession, upload.array('sendImg'), (req, res) => {
 
  //파일 삭제 -> 업데이트
      pool.getConnection(function (err, connection) {
        if (!err) {
          
          var sql =  "select *  FROM cs_file_dir WHERE cs_id=?;"
          var param = [req.body.cs_id]
          connection.query(sql, param, function (err, result) {
            if (!err) {
              
              var newsql = "UPDATE cs_log SET cs_edit_date = now(), cs_before_contents = (SELECT cs_contents from cs WHERE cs_id = ?) WHERE cs_id = ?;" +
                    "UPDATE cs SET cs_title = ? , cs_contents = ? WHERE cs_id = ?;" +"delete from cs_file_dir WHERE cs_id = ?;"
              var newparam = [req.body.cs_id, req.body.cs_id, req.body.cs_title, req.body.cs_contents, req.body.cs_id, req.body.cs_id ]
              console.log("111111111111111111111111111 ")
              var i = 0
              var j = 0
              while(result[i]!=null){
                //파일삭제
                fs.unlink("./"+ result[i].cs_file_path, function(err){
                  if( err ) {  console.log(err)}
                  console.log('file delete');
                });
                i++
              }
              console.log("22222222222222222222")
              while(req.files[j]!=null){
                newsql += "INSERT INTO cs_file_dir(cs_file_name, cs_file_path, cs_id) VALUE (?,?,?);"
                console.log("req.files[i].originalname: "+req.files[j].originalname)
                newparam = newparam.concat(req.files[j].originalname, req.files[j].path, req.body.cs_id)
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





//문의게시판 다운로드
app.get('/cs/download', function (req, res) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  * from cs_file_dir  where cs_id = ? and cs_file_name = ?;"
      var param = [req.query.send, req.query.name]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          if (result[0] != null) {

            var filePath = result[0].cs_file_path
            res.status(200).download(filePath)
          } else {

            console.log("에러:" + err)
            res.status(400).json({err: '6', contents: '경로에 파일이 없음'})
          }

        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({ err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({err: '2', contents: 'db 연결 실패'})
    }
  })

})

//문의게시판 검색
app.get('/cs/search', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if (func.checkSpace(req.query.send)) {

    pool.getConnection(function (err, connection) {
      if (!err) {

        //게시물 찾기
        var sql = "select cs_id, cs_title, cs_date from cs where cs_delete = 0  and match(cs_title) against(? IN boolean mode) ORDER BY cs_id DESC limit ?,?;" +
          "select count(cs_id) as num  from cs where cs_delete = 0  and match(cs_title) against(? IN boolean mode)"
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
        res.status(400).json({ err: '1', contents: 'db 연결실패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
})

//공지사항 게시판
app.get('/notice', function (req, res) {

  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  pool.getConnection(function (err, connection) {
    if (!err) {
      //총 게시물 개수
      connection.query("SELECT count(notice_id) as num FROM notice WHERE notice_delete = 0 ", function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          console.log('result[0].num: ' + result[0].num)
          if (postNum != 0) {
            //해당 페이지의 게시물 내용
            var sql = "SELECT notice_id, notice_title, notice_contents as num FROM notice WHERE notice_delete = 0 ORDER BY notice_id DESC limit ?, ?"
            var param = [limit, pageNum]
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
          res.status(400).json({err: '1', contents: '잘못된 값'})
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({err: '2', contents: 'db 연결실패' })
    }
  })

})

//공지사항 상세보기
app.get('/notice/detail', function (req, res) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  notice_file_name from notice left outer join notice_file_dir on notice.notice_id = notice_file_dir.notice_id where notice.notice_id = ?;" +
        "select * from notice where notice_id=?;"
      var param = [req.query.send, req.query.send]
      connection.query(sql, param, function (err, result) {

        if (!err) {
          connection.release();
          res.status(200).json({
            result: result
          })
        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})

//공지사항 검색
app.get('/notice/search', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if (func.checkSpace(req.query.send)) {

    pool.getConnection(function (err, connection) {
      if (!err) {

        //게시물 찾기
        var sql = "select notice_id, notice_title, notice_date from notice where notice_delete = 0  and match(notice_title) against(? IN boolean mode) ORDER BY notice_id DESC limit ?,?;" +
          "select count(notice_id) as num from notice where notice_delete = 0  and match(notice_title) against(? IN boolean mode)"
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
            res.status(400).json({err: '1', contents: '잘못된 값' })
          }


        })
      } else {
        connection.release();
        console.log("풀 에러")
        res.status(400).json({err: '2', contents: 'db 연결실패' })
      }
    })
  } else {
    console.log("검색어 공백")
    res.status(400).json({ result: "empty" })
  }
})

//공지사항 다운로드
app.get('/notice/download', function (req, res) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  * from notice_file_dir  where notice_id = ? and notice_file_name = ?;"
      var param = [req.query.send, req.query.name]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          if (result[0] != null) {

            var filePath = result[0].notice_file_path
            res.status(200).download(filePath)
          } else {

            console.log("에러:" + err)
            res.status(400).json({ err: '6', contents: '경로에 파일이 없음' })
          }

        } else {
          connection.release();
          console.log("에러:" + err)
          res.status(400).json({ err: '1', contents: '잘못된 값' })
        }
      })
    } else {
      connection.release();
      console.log("풀 에러")
      res.status(400).json({ err: '2', contents: 'db 연결실패' })
    }
  })

})





























module.exports = app;