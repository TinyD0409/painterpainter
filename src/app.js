const http = require('http')
const fs = require('fs')
const path = require('path')

const ws = require('ws')
const express = require('express')
const port = 9095
const app = express() //为了使用express中间件 ，而这些中间件转为了这个函数
const server = http.createServer(app) 

const pixelData = [
  ['red','yellow','red'],
  ['cyan','blue','green']
]

const wss = new ws.Server({server})

wss.on('connection',(ws,req) => {//req上有很多信息，有利于以后做账号系统
  //监听了这个连接
//先send 这个画布的pixelData 信息
  ws.send(JSON.stringify({
    type:'init',
    pixelData: pixelData,
  }))

  //监听 点的哪个点被点 ，想所有用户 发送回去
  ws.on('message',msg => {  //node环境下 都是on('事件')往上挂 而浏览器环境下就是 on事件名 或addeventlistener
    msg = JSON.parse(msg)
    if(msg.type == 'drawdot'){
      pixelData[msg.y][msg.x] = msg.color
      wss.clients.forEach(client => { 
        //A set that stores all connected clients. 
        //Please note that this property is only added when the clientTracking is truthy.
        //收到任何一个客户端发出的请求，发送给每个客户端
        client.send(JSON.stringify({
          type: 'updatedot',
          x:msg.x,
          y:msg.y,
          color:msg.color
        }))
      })
    }
  })
})
app.use(express.static(path.join(__dirname,'./static')))

 
server.listen(port,() => {
  console.log('server listening on port', port)
})
