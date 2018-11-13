const http = require('http')
const fs = require('fs')
const path = require('path')

const ws = require('ws')
const express = require('express')
const Jimp = require('jimp')
const port = 9095
const app = express() //为了使用express中间件 ，而这些中间件转为了这个函数
const server = http.createServer(app) 

const wss = new ws.Server({server})

const width = 1280
const height = 720

main()
async function main(){
  let img
  try {
    // pixelData = require('./pixel.json')
    img = await Jimp.read(path.join(__dirname,'./pixel.png'))
  } catch(e){
    // pixelData = new Array(height).fill(0).map(it => new Array(width).fill('white'))
    //用png的方式储存canvas画布上的内容
    img = new Jimp(1280,720,0xffffffff)
  }
  
  var lastUpdate = 0
  setInterval(() => {
    var now = Date.now()
    if (now - lastUpdate < 3000){
      img.write(path.join(__dirname,'./pixel.png'),() => {
        console.log('data save', now)
      })
    }
  },3000)
  
  
  wss.on('connection',(ws,req) => {//req上有很多信息，有利于以后做账号系统
    //监听了这个连接
    //先send 这个画布的pixelData 信息
    img.getBuffer(Jimp.MIME_PNG,(err,buf) => {
      if(err){
        console.log('get buffer err',err)
      }else {
        ws.send(buf)
      }
    })
    //ws.send(JSON.stringify({ 
      //而变成png图片存储之后，发送的就要是一个二进制buffer了，善于利用搜索引擎 
      //如何利用ws模块 发送二进制buffer
      //type:'init',
      //pixelData: pixelData,
    //}))
  
    var lastDraw = 0
  
    //监听 点的哪个点被点 ，想所有用户 发送回去
    ws.on('message',msg => {  //node环境下 都是on('事件')往上挂 而浏览器环境下就是 on事件名 或addeventlistener
      msg = JSON.parse(msg)
  
      var now = Date.now()
      var {x,y,color} = msg
      if(msg.type == 'drawdot'){ 
        if(now - lastDraw < 200){ //建立连接的用户才能按这个频率来发
          return
        }
        if(x > 0 && y > 0 && x < width && y < height){ //限制宽高
          lastDraw = now
          lastUpdate = now
          // pixelData[msg.y][msg.x] = msg.color
          img.setPixelColor(Jimp.cssColorToHex(color),x,y) 
          wss.clients.forEach(client => { 
            //clients 方法：A set that stores all connected clients. 
            //Please note that this property is only added when the clientTracking is truthy.
            //收到任何一个客户端发出的请求，发送给每个客户端
            client.send(JSON.stringify({
              type: 'updatedot',
              x,y,color
            }))
          })
        }
      }
    })
  })
  app.use(express.static(path.join(__dirname,'./static')))
  
   
  server.listen(port,() => {
    console.log('server listening on port', port)
  })
}
