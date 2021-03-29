
const nodemailer = require('nodemailer')//메일보내기
const schedule = require('node-schedule')//특정시간에 이벤트 발생
const crypto = require('crypto')//암호화
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
    //res.redirct('/')
  
    // return res.send( '세션만료' )
  } else {

    console.log('유효함')


  }
  return next()
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



//-------------------------------------------------------------------------------------------------------------------
//메일을 보낼 이메일
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






//메일 보내기---------------------------------------------------------------------------------------------------------
func.SendCheckEmail = async function (go_mail, key, fla) {
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


    await smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
        console.log(error)
        console.log("이메일 에러")

      } else {

        console.log("이메일 성공")

      }
      smtpTransport.close();
    });
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

}

module.exports = func