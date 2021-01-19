const express = require('express')
const redis = require('redis')
const fetch = require('node-fetch')

const PORT = process.env.PORT || 3001
const REDIS_PORT = process.env.PORT || 6379

const client = redis.createClient(REDIS_PORT);

const app = express()

 function setResponse(username,follow){
    return  `<h1>${username} has ${follow} set of following programmers in github...</h1>`
}


async function getRepos(req, res, next){
try{
    console.log('Fetching data...')
   const {username}= req.params;
let response = await fetch(`https://api.github.com/users/${username}`)

const data =await response.json()

const follow = data.following


// set data to redis
client.setex(username,3600,follow)
res.send(setResponse(username,follow))

}catch(err){
    console.log(err)
    res.status(500)
}}

//cache middleware
function cache(req, res, next){
   const {username} = req.params;

   client.get(username,(err,data)=>{
    if(err) throw err
    if(data !==null){
  res.send(setResponse(username,data))
}else{
    next();
}
})

}

app.get('/repos/:username',cache, getRepos)

app.listen(3001,()=>{
    console.log(`server is running on port ${PORT}`)
})