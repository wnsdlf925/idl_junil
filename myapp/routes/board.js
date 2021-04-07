
const express = require('express')
const app = express()
app.use(express.json())
var urlencode = require('urlencode');
require('dotenv').config() //env
let pool = require('../common/database.js')//db 
let sess = require('../common/session.js')//세션
let func = require('../common/func.js');//함수
let upload = require('../common/upload.js');//파일 업로드
let session = sess.session
app.use(session)
const pageNum = 15

//참여자 순위와 목록










//문의게시판 올리기, 한글깨짐
app.post('/csUpload',func.ChkSession,upload.array('sendImg'),function(req,res){
  if(req.files[0]==null){
    pool.getConnection (function(err, connection){
      if(!err){
        var sql = "INSERT INTO cs( cs_contents, cs_title, cs_date, member_email, cs_secret) VALUE( ?, ?, curdate(),?,?);"+
        "INSERT INTO cs_log(cs_id, cs_edit_date, cs_before_contents ) VALUE((select MAX(cs_id) FROM cs WHERE member_email=? and cs_title = ?), now(),?);"
        var param = [ req.body.contents, req.body.title, req.session.myEmail, req.body.secret, req.session.myEmail, req.body.title, req.body.contents]
        
        connection.query(sql, param, function(err,result){
          if(!err){
            connection.release();
            console.log("성공")
            res.json({ notice: "ok" })
            
          }else{
            connection.release();
            console.log(req.body.title)
            res.json({ db: err })
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
        var sql = "INSERT INTO cs( cs_contents, cs_title, cs_date, member_email, cs_secret) VALUE( ?, ?, curdate(),?,?);"+
        "INSERT INTO cs_log(cs_id, cs_edit_date, cs_before_contents ) VALUE((select MAX(cs_id) FROM cs WHERE member_email=? and cs_title = ?), now(),?);"
        var param = [ req.body.contents, req.body.title, req.session.myEmail, req.body.secret, req.session.myEmail, req.body.title, req.body.contents]
        
        connection.query(sql, param, function(err,result){
          if(!err){
            var i = 1
            var newsql = "INSERT INTO cs_file_dir(cs_file_name, cs_file_path, cs_id ) VALUE(?,?,(select MAX(cs_id) FROM cs WHERE member_email=? ));"
            var ex =  [req.files[0].originalname ,req.files[0].path, req.session.myEmail]
            while(req.files[i]!=null){
              newsql = newsql + "INSERT INTO cs_file_dir(cs_file_name, cs_file_path, cs_id ) VALUE(?,?,(select MAX(cs_id) FROM cs WHERE member_email=? ));"
              ex = ex.concat(req.files[i].originalname ,req.files[i].path, req.session.myEmail)
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
            res.json({ 첫db: err })
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

//문의게시판 올리기 직전
app.get('/csUploadBef',func.ChkSession,function(req,res){
res.json({name: req.session.myName})

})


//공지사항 게시판
app.get('/notice', function(req, res ) {

  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  pool.getConnection(function (err, connection) {
    if (!err) {
      //총 게시물 개수
      connection.query("SELECT count(notice_id) as num FROM notice WHERE notice_delete = 0 ",  function (err, result) {
        if (!err) {
          var postNum = func.checkPage(result[0].num)
          console.log('result[0].num: ' + result[0].num)
          if (postNum != 0) {
            //해당 페이지의 게시물 내용
            var sql = "SELECT notice_id, notice_title, notice_contents as num FROM notice WHERE notice_delete = 0  limit ?, ?"
            var param = [ limit, pageNum]
            connection.query(sql, param, function (err, result) {
              if (!err) {
                connection.release();
                res.json({
                  result: result,
                  postNum: postNum
                })
              } else {
                connection.release();
                console.log("에러:" + err)
                res.json({ db: "err" })
              }
            })
          } else {
            connection.release();
            console.log("result:" + 0)
            res.json({ result: "empty" })
          }
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

//공지사항 상세보기
app.get('/notice/detail', function(req, res ) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  notice_file_name from notice left outer join notice_file_dir on notice.notice_id = notice_file_dir.notice_id where notice.notice_id = ?;"+
      "select * from notice where notice_id=?;"
      var param = [req.query.send, req.query.send]
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

//공지사항 검색
app.get('/notice/search', (req, res) => {
  var limit = 15 * (req.query.pageNum - 1)
  console.log('limit: ' + limit)
  if(func.checkSpace(req.query.send)){
    
    pool.getConnection(function (err, connection) {
      if (!err) {
        
        //게시물 찾기
        var sql = "select notice_id, notice_title, notice_date from notice where notice_delete = 0  and match(notice_title) against(? IN boolean mode) limit ?,?;"
        var param = [ urlencode.decode(req.query.send) +'*', limit, pageNum]
        connection.query(sql, param, function (err, result) {
          if(!err){
            
            if(result[0]==null){
              
              connection.release();
              console.log("result:" + 0)
              res.json({ result: "empty" })
            }else{
              
              var postNum = func.checkPage(result.length)
              connection.release();
                  res.json({ result: result,
                    postNum: postNum
                  })

            }

            }else{
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
  }else{
    console.log("검색어 공백")
    res.json({ result: "검색어 공백" })
  }
})

//공지사항 다운로드
app.get('/notice/download', function(req, res ) {

  pool.getConnection(function (err, connection) {
    if (!err) {
      var sql = "SELECT  * from notice_file_dir  where notice_id = ? and notice_file_name = ?;"
      var param = [req.query.send, req.query.name ]
      connection.query(sql, param, function (err, result) {
        if (!err) {
          connection.release();
          if(result[0]!=null){

            var filePath =  result[0].notice_file_path
            res.download(filePath)
          }else{
          
          console.log("에러:" + err)
          res.json({ file: "err" })
          }
          
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



/* 다운로드 요청 처리 */

// app.get("/download", function(req, res){

//   // 요청시 해당 파일의 id값을 쿼리로 붙여서 전달합니다.(선택된 파일을 DB에서 찾기 위해)

//   var _id = req.query.id;​

//   // id를 사용해 데이터를 찾음

//   DBData.findOne({"_id":_id})

//    .select("orgFileName saveFileName") // 해당파일의 원래이름과 저장된 이름을 가져옴

//    .exec(function(err, data){ // 완료되면 찾은 데이터는 data에 담깁니다.     

//    var filePath = __dirname + "/../upload/" + data.saveFileName; // 다운로드할 파일의 경로​     

//    var fileName = data.orgFileName; // 원본파일명​

//    // 응답 헤더에 파일의 이름과 mime Type을 명시한다.(한글&특수문자,공백 처리)

//    res.setHeader("Content-Disposition", "attachment;filename=" + encodeURI(fileName));

//    res.setHeader("Content-Type","binary/octet-stream");

//    // filePath에 있는 파일 스트림 객체를 얻어온다.(바이트 알갱이를 읽어옵니다.)

//    var fileStream = fs.createReadStream(filePath);

//    // 다운로드 한다.(res 객체에 바이트알갱이를 전송한다)

//    fileStream.pipe(res);

//  });

// });

























module.exports = app;