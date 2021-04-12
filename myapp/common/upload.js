const multer = require("multer");
const express = require('express')
const app = express()
app.use(express.json())
const path = require("path");

const utf8 = require('utf8');


let storage = multer.diskStorage({
    destination: function(req, file ,callback){
        
        callback(null, "./file")
    },
    filename: function(req, file, callback){
        console.log("file.originalname: "+file.originalname)
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension);
    }
});

//미들웨어 등록, 20MB제한
let upload = multer({
    storage: storage,
    limits: {fileSize: 20*1024*1024}
  
});

// app.get('/show', function(req, res, next) {
//   res.render("board")
// });

// // 2. 파일 업로드 처리
// app.post('/create', upload.single("sendImg"), function(req, res, next) {
//   // 3. 파일 객체
//   let file = req.file

//   // 4. 파일 정보
//   let result = {
//     file
//   }

//   res.json(result);
// });

 module.exports = upload;