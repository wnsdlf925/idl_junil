// import {connection} from "mysql.js"
const express = require('express')
let session = require('express-session')
let MySQLStore = require('express-mysql-session')(session)
const nodemailer = require('nodemailer')//메일보내기
const schedule = require('node-schedule')//특정시간에 이벤트 발생
const crypto = require('crypto')//암호화
var mysql = require("mysql")
require('dotenv').config()
const app = express()
app.use(express.json())

const realPhone = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호 정규식
const realEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식

const port = process.env.SERVER_PORT

//시간
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var dt = new Date();

//db연결
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
})

//세션
let sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
 
})

app.use(session({
  key: 'session_cookie_name',
	secret: 'session_cookie_secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: true
  // cookie:{maxAge:3000000}

}));



//양방향 암호화 
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || CRT_ENCRYPTION_KEY.repeat(2); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

//메일을 보낼 이메일
const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PW
  },
  tls: {
    rejectUnauthorized: false
  }
});


connection.connect()




//**나중에 res.send 프론트에 맞게 설정하기**
//전화번호 암호화 복호화
//비밀번호 암호화

//15분마다 인증키시간 초기화--------------------------------------------------------------------------------------------------


const authReset = schedule.scheduleJob('0 15,30,45,0 * * * *', function(){

  var reDate = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+(dt.getDate())+' '+(dt.getHours())+':'+(dt.getMinutes()-5)+':'+(dt.getSeconds());
  connection.query('SET SQL_SAFE_UPDATES = 0',function(err,results){
    if(!err){
      console.log("SET SQL_SAFE_UPDATES=0: 성공") 
    }else{
      console.log("err: "+err) 
    }
  })
  connection.query("UPDATE email_auth SET email_auth_flag = 0, email_dispose = 1 WHERE  email_date <"+"'"+reDate+"'",function(err,results){
    if(!err){
      console.log("UPDATE: 성공") 
    }else{
      console.log("err: "+err) 
    }
  })
  connection.query('SET SQL_SAFE_UPDATES = 1',function(err,results){
    if(!err){
      console.log("SET SQL_SAFE_UPDATES = 1: 성공") 
    }else{
      console.log("err: "+err) 
    }

  })
  console.log('매 15분에 실행');
});
//--------------------------------------------------------------------------------------------------------------------------



//비밀번호 암호화-------------------------------------------------------------------------------------------------------------------
 //암호화  솔트
 const salt = CRT_SALT

 
   function Pass(keypw) {
     
    console.log("pass") 
    var ex = crypto.pbkdf2Sync(keypw, salt, 10000, 64, 'sha512')
      return ex.toString('base64');
        
}
//----------------------------------------------------------------------------------------------------------------------------------




//전화번호 암호화, 복호화-------------------------------------------------------------------------------------------------------------------
function Encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = cipher.update(text);
 
  return iv.toString('hex') + ':' + Buffer.concat([encrypted, cipher.final()]).toString('hex');
 }
 
 function Decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = decipher.update(encryptedText);
 
  return Buffer.concat([decrypted, decipher.final()]).toString();
 }
//-------------------------------------------------------------------------------------------------------------------


//메일 보내기---------------------------------------------------------------------------------------------------------
async function SendCheckEmail(go_mail, key) {
  console.log("보내기에서 받은"+go_mail)
  const mailOptions = {

    from: MAIL_USER,
    to:  go_mail ,
    subject: "보아라 ",
    text: "localhost:3000/check?send="+ key
  };
  console.log("이메일생성")


  await smtpTransport.sendMail(mailOptions, (error, responses) => {
    if (error) {
      console.log(error)
      console.log("이메일 에러")
      
    } else {
      
      console.log("이메일 성공")
     
    }
    smtpTransport.close();
  });
}
//--------------------------------------------------------------------------------------------------------------




//회원가입, 로그 db에 등록하기
app.post('/join', (req, res) => {

if( realPhone.test(req.body.member_phone)==true && realEmail.test(req.body.member_email) == true){//전화번호 정규식
 
  var joinlog = moment().format('YYYY-MM-DD HH:mm:ss');
  var sql = "INSERT INTO ideapf.member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) VALUE(?,?,?,?,?,?,?,?,?);"+
  "INSERT INTO member_login_log (member_email,member_login) VALUE(?,?);"+
  "INSERT INTO member_log (member_email,member_log_join,member_login_lately) VALUE(?,?,?);"
  var param = [req.body.member_email, req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, Pass(req.body.member_pw), Encrypt(req.body.member_phone), req.body.chosen_agree, req.body.member_email, joinlog, req.body.member_email,joinlog,joinlog]
  console.log(param) 
  connection.query(sql,param,function(err,rows,fields) {
    if (!err) {
        console.log(rows) 
      console.log("DB Connection Succeeded")
      
    } else {
      console.log("DB Connection Failed")
     

      console.log(err) 
    }
  })
  
  res.send('Hello World!')
}else{
  res.send('전화번호나 이메일이 형식에 맞지 않습니다.')
}
})


//이메일 중복확인 및 인증url보내기

app.post('/join_auth', (req, res) => {

//인증키 여러번 보냈는지 쿼리
  connection.query("SELECT * FROM ideapf.email_auth WHERE rec_email ="+ "'" +req.body.rec_email + "'"+" and email_auth_flag = '0'and email_dispose = '0'",async function(err,results){
    
    if (!err) {

      //인증키 여러번 보냈는지 확인
      if(results[0] == null){

        
        //이미 가입한 이메일인지 쿼리
        await connection.query("SELECT member_email FROM member WHERE member_email = " + "'" +req.body.rec_email + "'",    function (err, result, fields) {
        
          if (!err) {
            //이미 가입한 이메일인지 확인
              if (result[0] == null) {
                var ran = Math.random().toString(36).substr(2,8);

                //이메일 인증 테이블에 넣기
                var strdate = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+(dt.getDate())+' '+(dt.getHours())+':'+(dt.getMinutes())+':'+(dt.getSeconds());
                var sql = "INSERT INTO email_auth (email_key, email_date, rec_email) VALUE("+"'" + ran + "','" + strdate + "','"+req.body.rec_email+ "'"+")"
                var param = [ran ,strdate ,req.body.rec_email]
                 connection.query(sql,param,  function (err,results) {
                  if (!err) {
                    SendCheckEmail(req.body.rec_email,ran)
                    
                    console.log("DB Connection Succeeded이메일 테이블")
                    
                  } else {
                    console.log(err)
                    console.log("DB Connection Failed이메일 테이블")
        
                  }
                })
              } else {
                console.log('중복됨')
              }
        
              console.log("DB Connection Succeeded중복확인")
            
            
                  
                } else {
                  console.log("DB Connection Failed중복확인")
                }
      
        })
        console.log("리솔트가 널 : "+results)

      }else{
        console.log("리솔트 : "+results)
        console.log("인증키 두번누름")
        
      }
    }else{
      console.log('err'+err)
      console.log("인증키 두번누름 부분 에러")
    }
  })

  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//이메일 인증

app.get('/check', (req, res) => {

  connection.query("SELECT * FROM ideapf.email_auth WHERE email_key = " + "'" + req.query.send + "'", function(err,results,fields){

    if(err){
      console.log(err)
    }else{
      console.log('results: '+results)
      //이메일 인증키가 있다면
    if(results[0].email_key == req.query.send ){
     
      //인증키가 유효하다면
      if(results[0].email_auth_flag == 0 && results[0].email_dispose == 0){
        connection.query("UPDATE email_auth SET email_auth_flag = 1, email_dispose = 1 WHERE  email_key_id ="+ results[0].email_key_id , function(err,result){
          if(err){
          console.log(err)
          }else{
          //res.redirect("/join")
          console.log("리다이렉션.")
          }
        })
        
      }else{
        console.log("이미 만료된 번호입니다. 다시 인증하셈")
      }
      
    } else{
      console.log("인증실패 테이블에 없음")
    }
  }
  })

  res.send('Hello World!')
})



//로그인

app.post('/login',(req, res)=>{



  connection.query("SELECT * from member WHERE member_email = '"+ req.body.email+"'and member_pw = '"+Pass(req.body.pw)+"'",function(err,result){
if(!err){
  
  if(result!=null){
    var user = {
      myid : result[0].member_email,
      mypw :  result[0].member_pw,
      displayName:  result[0].member_name
    };
    req.session.myid=user.myid
    req.session.mypw=user.mypw
    req.session.displayName = user.displayName
    req.session.save(()=>{
      console.log("리다이렉션")
      console.log("이름"+req.sessionID)
      
     // res.redirect('/');
    })
    console.log("로그인 성공")
  }else{
    console.log("로그인 실패")
  }
}else{
  console.log("에러: "+err)

}
  })
res.send('로그인')


})


//로그아웃

app.get('/loginout',(req, res)=>{
  console.log(req.session.displayName)
  console.log(req.session.mypw)
  console.log(req.session.myid)
  console.log(req.cookies)
  console.log("이름"+req.sessionID)
  req.session.destroy(function(err){ 
    req.session;
    });

  res.send('로그아웃');

})
