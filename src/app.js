const http = require('http')
const path = require('path')

const port = 9093
const socketIO = require('socket.io')
const express = require('express')
const Jimp = require('jimp')
const app = express() 
const server = http.createServer(app) 
const io = socketIO(server)
const width = 1280
const height = 720 

main()
async function main(){
  let img
  try {
    img = await Jimp.read(path.join(__dirname,'./pixel.png'))
  } catch(e) {
    img = new Jimp(1280,720,0xffffffff)
  }
  
  var lastUpdate = 0
  setInterval(() => {
    var now = Date.now()
    if (now - lastUpdate < 3000){
      img.write(path.join(__dirname,'./pixel.png'),() => {
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
  io.on('connection',(ws,req) => {
    //req上有很多信息，有利于以后做账号系统
    img.getBuffer(Jimp.MIME_PNG,(err, buf) => {
      if(err){
        console.log('get buffer err',err)
      } else {
        ws.emit('init', buf)
      }
    })

    io.emit('onlineCount',{
      count: Object.keys(io.sockets.sockets).length
    })

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
        img.setPixelColor(Jimp.cssColorToHex(color),x,y)
        userOperations.push({x,y,color})
      }
    })
  })
  app.use(express.static(path.join(__dirname,'./static')))
  
   
  server.listen(port,() => {
    console.log('server listening on port', port)
  })
}
