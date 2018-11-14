const http = require('http')
const path = require('path')

const socketIO = require('socket.io')
const express = require('express')
const Jimp = require('jimp')
const port = 9095
const app = express() //为了使用express中间件 ，而这些中间件转为了这个函数
const server = http.createServer(app) 
const io = socketIO(server)
const width = 1280
const height = 720

main()
async function main(){
  let img
  try {
    // pixelData = require('./pixel.json')
    img = await Jimp.read(path.join(__dirname,'./pixel.png'))
  } catch(e) {
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
  
  global.io = io
  let userOperations = []
  setInterval(() => {
    if (userOperations.length){
      io.emit('updateDot', userOperations)
      userOperations = []
    }
  }, 300)
  io.on('connection',(ws,req) => {//req上有很多信息，有利于以后做账号系统
    //监听了这个连接
    //先send 这个画布的pixelData 信息
    img.getBuffer(Jimp.MIME_PNG,(err, buf) => {
      if(err){
        console.log('get buffer err',err)
      } else {
        ws.emit('init', buf)
      }
    })
    //ws.send(JSON.stringify({ 
      //而变成png图片存储之后，发送的就要是一个二进制buffer了，善于利用搜索引擎 
      //如何利用ws模块 发送二进制buffer
      //type:'init',
      //pixelData: pixelData,
    //}))
    
    //有人进来发送一个json,而且每来一个人都要广播一下,而不是给一个人发
    // wss.clients.forEach(ws => {
    //   ws.send(JSON.stringify({
    //     type: 'onlineCount',
    //     count: wss.clients.size,
    //   }))
    // })
    //用socketio更方便 （类似react里事件的派发
    io.emit('onlineCount',{
      count: Object.keys(io.sockets.sockets).length
    })

    //有人走 也发送一个json
    ws.on('close', () => {
      io.emit('onlineCount', {
        count: Object.keys(io.sockets.sockets).length
      })
    })
    var lastDraw = 0
    
    ws.on('drawDot', data => {
      var now = Date.now()
      var {x,y,color} = data
      if(now - lastDraw < 200){ //建立连接的用户才能按这个频率来发
        return
      }
      if(x > 0 && y > 0 && x < width && y < height){ //限制宽高
        lastDraw = now
        lastUpdate = now
        // pixelData[msg.y][msg.x] = msg.color
        img.setPixelColor(Jimp.cssColorToHex(color),x,y)
        // io.emit('updateDot', {
        //   x,y,color
        // })
        userOperations.push({x,y,color})
        //console.log(userOperations)
      }
    })
    //监听 点的哪个点被点 ，想所有用户 发送回去
    // ws.on('message',msg => {  //node环境下 都是on('事件')往上挂 而浏览器环境下就是 on事件名 或addeventlistener
    //   msg = JSON.parse(msg)
  
    //   var now = Date.now()
    //   var {x,y,color} = msg
    //   if(msg.type == 'drawDot'){ 
    //     if(now - lastDraw < 200){ //建立连接的用户才能按这个频率来发
    //       return
    //     }
    //     if(x > 0 && y > 0 && x < width && y < height){ //限制宽高
    //       lastDraw = now
    //       lastUpdate = now
    //       // pixelData[msg.y][msg.x] = msg.color
    //       img.setPixelColor(Jimp.cssColorToHex(color),x,y) 
    //       wss.clients.forEach(client => { 
    //         //clients 方法：A set that stores all connected clients. 
    //         //Please note that this property is only added when the clientTracking is truthy.
    //         //收到任何一个客户端发出的请求，发送给每个客户端
    //         client.send(JSON.stringify({
    //           type: 'updateDot',
    //           x,y,color
    //         }))
    //       })
    //     }
    //   }
    // })
  })
  app.use(express.static(path.join(__dirname,'./static')))
  
   
  server.listen(port,() => {
    console.log('server listening on port', port)
  })
}
