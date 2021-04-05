
const nodemailer = require('nodemailer')//메일보내기
//const schedule = require('node-schedule')//특정시간에 이벤트 발생
const crypto = require('crypto')//암호화
let pool = require('../common/database.js')//db 
const { release } = require('os')
require('dotenv').config()
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.CRT_ENCRYPTION_KEY.repeat(2); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16



var func = {}
//비밀번호 암호화-------------------------------------------------------------------------------------------------------------------
//암호화  솔트
const salt = process.env.CRT_SALT
func.Pass = function(keypw) {

  console.log("pass")
  var ex = crypto.pbkdf2Sync(keypw, salt, 10000, 64, 'sha512')
  return ex.toString('base64');

}
//----------------------------------------------------------------------------------------------------------------------------------



//세션 유효시간 검사예시----------------------------------------------------------------------------------------------------------------------------------
 func.ChkSession =function(req, res, next) {



  // 만료 확인 후 세션 삭제 
  if (req.session.myEmail == null) {

    console.log('만료됨')
    
    return res.json({move: '/'})
  } else {

    console.log('유효함')


    return next()
  }
}

//----------------------------------------------------------------------------------------------------------------------------------



//전화번호 암호화, 복호화-------------------------------------------------------------------------------------------------------------------
 func.Encrypt = function(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = cipher.update(text);

  return iv.toString('hex') + ':' + Buffer.concat([encrypted, cipher.final()]).toString('hex');
}

 func.Decrypt = function(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = decipher.update(encryptedText);

  return Buffer.concat([decrypted, decipher.final()]).toString();
}
//-------------------------------------------------------------------------------------------------------------------



//메일을 보낼 이메일--------------------------------------------------------------------------------------------------
const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PW
  },
  tls: {
    rejectUnauthorized: false
  }
});
//-------------------------------------------------------------------------------------------------------------------

//등수----------------------------------------------------------------------------------------------------------
//사용자 가입 -> 등수가 가장 높은 사람이 0이면 그사람과 같게 아니면 +1 널이면 내가 1 
//등수가 가장 높은 사람의 등수와 그 사람들의 점수의 합
func.RankCheck =  function () {
  return new Promise(function(resolve, reject){

    console.log('000000')
    pool.getConnection(  function (err, connection) {
      if (!err) {
        console.log('111111')
        
        connection.query( "select max(member_rank) as newRank , sum(member_point) as newPoint from member where member_rank = (select MAX(member_rank) FROM member where member_ban =0 and member_secede =0);" , function (err, result) {
          if(err){reject('쿼리 에러')}

          if(result[0]==null){
            resolve(1)
            }else if(result[0].newPoint == 0){
              resolve(result[0].newRank)
            }else {
              resolve(result[0].newRank+1)
            }
        })

      } else {
        
        console.log('풀 에러')
        reject('풀 에러')
    }
    
  })
  
})
  
}


//-------------------------------------------------------------------------------------------------------------------



//메일 보내기---------------------------------------------------------------------------------------------------------
func.SendCheckEmail =  function (go_mail, key, fla) {
  return new Promise(function(resolve,reject){

    //이메일 인증 메일
    if (fla == 1) {
      console.log("보내기에서 받은" + go_mail)
      const mailOptions = {
        
        from: process.env.MAIL_USER,
      to: go_mail,
      subject: "보아라 ",
      text: "localhost:3000/check?send=" + key
    };
    console.log("이메일생성")
    
    smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
        console.log(error)
        reject('error')
      
        
      } else {
        console.log("이메일 성공")
        resolve("ok")
        
      }
      smtpTransport.close();
    });
    
    console.log("00000000000")
    
    //비밀번호 찾기 인증 메일
  } else {
    console.log("보내기에서 받은" + go_mail)
    const mailOptions = {
      
      from: process.env.MAIL_USER,
      to: go_mail,
      subject: "보아라 ",
      text: "localhost:3000/checkpw?send=" + key
    };
    console.log("이메일생성")
    
    
    smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
        console.log(error)
        reject('error')
        
        
      } else {
        
        resolve('ok')
        
      }
      smtpTransport.close();
    });
    
  }
})
  
}
//-------------------------------------------------------------------------------------------------------------------



//페이지 개수---------------------------------------------------------------------------------------------------------


func.checkPage = function(totalPost){

  if(totalPost !=0){
    var postNum = totalPost
    console.log('postNum: '+ postNum%15 != 0 )
    if(postNum%15 != 0){
      return postNum = parseInt(postNum/15 +1)
    }else{
      return postNum = parseInt(postNum/15)
    }

}else{
  console.log("result:" + 0)
  return 0
}



}





//-------------------------------------------------------------------------------------------------------------------



module.exports = func