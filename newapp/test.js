async function logName() {

 await setTimeout(() => {
    console.log("셋타임아웃")
  }, 1000);
  await name()
  console.log("000000")

  // var user = await fetchUser('domain.com/users/1');
  // if (user.id === 1) {
  //   console.log(user.name);
  // }
}

logName()

async function name() {

  await setTimeout(() => {
     console.log("네임")
   }, 1000);
   console.log("11111")
 
 
 
   // var user = await fetchUser('domain.com/users/1');
   // if (user.id === 1) {
   //   console.log(user.name);
   // }
 }