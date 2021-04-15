
const express = require('express')
const app = express()
app.use(express.json())

let pool = require('./database.js')//db 
let func = require('./func.js');//함수
const noti = /^[0-9]/;
const puppeteer = require('puppeteer');
let nextPage = true //크롤링 페이지 넘기기
let oriUrl = 'https://cse.kangwon.ac.kr/index.php?mt=page&mp=5_3&mm=oxbbs&oxid=6&key=&val=&subcmd=&CAT_ID=0&artpp=15&cpage='
var win = require('../config/winston');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");




var cron = require('node-cron');


cron.schedule('* * */24 * * *', async() => {

 await func.insertRank()
  checkCrawl()
//랭킹
});




var crawl = {}

async function fizz () {

  let indexnum = 1
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: false
  });
  const page = await browser.newPage();
  console.log("page: "+page)
 
  let data = [];
  while (nextPage) {

    newUrl = oriUrl + indexnum
    await page.goto(newUrl);
    data.push(await getAll(page));
    indexnum++
  }
  indexnum = 1
  nextPage = true

  await browser.close();

  return Promise.resolve(data);

};

async function getAll(page) {
let data = [];

const number = await page.$$eval("#bbsWrap > table > tbody > tr ", (data) => data.length);

// tr태그의 개수를 세어서 줄의 개수를 얻은 후에
for (let i = 0; i < number; i++) {
  data.push(await getOne(page, i + 1));

  // 각 줄의 정보를 얻어서 배열에 Push
}
return Promise.resolve(data);
}

async function getOne(page, index) {

let data = {};


data.name = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.tit > a", (data) => data.title);
data.link = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.tit > a", (data) => data.href);
data.date = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.dt", (data) => data.textContent);
data.num = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.no", (data) => data.textContent);

if (data.num == 1) {
  nextPage = false
}

await page.goto(data.link);
rawcontents = await page.$eval("#oxbbsPrintArea > div > div.note  ", (data) => data.innerHTML)
data.contents = rawcontents.replace(/src="_/gi, "src=\"https://cse.kangwon.ac.kr/")
//await page.$eval("#oxbbsPrintArea > div > div.note > div > a > img");
await page.goto(newUrl);

return Promise.resolve(data);



}







crawl.inserCrawl = async function() {
  console.log("111111111111111111")
  const data = await fizz();
  console.log("333333333333")
  var firLength = data.length
  var secLength 
  var newsql = ""
  var ex = []
  return new Promise(function(resolve, reject) {
  if(data[0][0]!=null){
    
    
    for(var i = 0 ;  i < firLength ; i++){
      secLength = data[i].length
      
      for(var j = 0; j <secLength; j++){
        console.log("4444444444444")
        newsql = newsql + "insert INTO anno (anno_title, anno_contents, anno_date, anno_link, anno_ref) Value (?,?,?,?,'강원대학교');"
        ex = ex.concat(data[i][j].name, data[i][j].contents, data[i][j].date, data[i][j].link)
        
      }
    }
    
    
  }else{
    console.log("data is empty")
    
  }
  
  pool.getConnection(function (err, connection) {
    if (!err) {
      connection.query(newsql, ex, function (err, result) {
        if (!err) {
          connection.release();
          console.log("555555555555555555")
          resolve(true) 
        } else {
          connection.release();
          console.log(err)
          resolve(false) 
          
        }
      })
      
      
      
    } else {
      connection.release();
      console.log("풀 에러")
      
    }
  })
})
}






async function checkCrawlAll(){
  var newdate = moment().subtract(1, 'd').format("YYYY-MM-DD");;
  var contin = true
  return Promise.resolve(ffdz());
  async function ffdz () {
    
    let indexnum = 1
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    
    let data = [];
    while (nextPage) {
      newUrl = oriUrl + indexnum
      await page.goto(newUrl);
      data.push(await getAll(page));
      indexnum++
    }
    indexnum = 1
    nextPage = true
  await browser.close();
  return Promise.resolve(data);
  
};

async function getAll(page) {
  let data = [];
  const number = await page.$$eval("#bbsWrap > table > tbody > tr ", (data) => data.length);
  
  // tr태그의 개수를 세어서 줄의 개수를 얻은 후에
  for (let i = 0; i < number; i++) {
    if(contin){
      var expush = (await getOne(page, i + 1))
      if(expush != undefined){
        data.push(expush);
        console.log("expush1: "+ expush)
        console.log("data getall: "+ data)
      }else{
        console.log("expush2: "+ expush)
      }
    }else{
      nextPage = false
      break
    }
    // 각 줄의 정보를 얻어서 배열에 Push
  }
  return Promise.resolve(data);
}

async function getOne(page, index) {

let data = {};


 data.name = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.tit > a", (data) => data.title);
 data.link = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.tit > a", (data) => data.href);
 data.date = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.dt", (data) => data.textContent);
 data.num = await page.$eval("#bbsWrap > table > tbody > tr:nth-child(" + index + ") > td.no", (data) => data.textContent);

  if(data.date>newdate && noti.test(data.num)==true){

    await page.goto(data.link);
    rawcontents = await page.$eval("#oxbbsPrintArea > div > div.note  ", (data) => data.innerHTML)
    data.contents = rawcontents.replace(/src="_/gi, "src=\"https://cse.kangwon.ac.kr/")
    await page.goto(newUrl);
    console.log("insert")
    return Promise.resolve(data);

  }else if(noti.test(data.num)==false){
    
    console.log("공지")
  }else{
    contin = false
    console.log("stop")
   
  }
  if (data.num == 1) {
    nextPage = false
  }






}

}

crawl.checkCrawl = async function() {
  const data = await checkCrawlAll();
  
  var firLength = data.length
  var secLength 
  var newsql = ""
  var ex = []
  if(data[0][0]!=null){
    
   
    for(var i = 0 ;  i < firLength ; i++){
      secLength = data[i].length
      
      for(var j = 0; j <secLength; j++){
        
        newsql = newsql + "insert INTO anno (anno_title, anno_contents, anno_date, anno_link, anno_ref) Value (?,?,?,?,'강원대학교');"
        ex = ex.concat(data[i][j].name, data[i][j].contents, data[i][j].date, data[i][j].link)
        
      }
    }
    
    
    
    pool.getConnection(function (err, connection) {
      if (!err) {
        connection.query(newsql, ex, function (err, result) {
          if (!err) {
            connection.release();
            win.info('daily carwling ok')
            console.log(err)
            
          } else {
            connection.release();
            win.info('daily carwling err')
            console.log(err)
           
          }
        })
        
        
        
      } else {
      connection.release();
      win.info('daily carwling db err')
      console.log("풀 에러")
      
    }
  })
}else{
  console.log("data is empty")
  
}
}
  
























module.exports = crawl