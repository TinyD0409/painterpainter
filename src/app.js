http
fs
path

const ws = require('ws')
const express =require('express')
const port = 9095
const
const app = express()

const pixelData = [
  ['red','yellow','red'],
  ['cyan','blue','green']
]

server = http.createServer(app)
wss new ws.Server({server})

wss.on('connection',(ws,req) => {
  ws.send(JSON.stringify({
    type:'init',
    pixelData:pixelData
  }))
  ws.on('message',msg => {
    msg = JSON.parse(msg)
    if(msg.type ==='drawdot'{
      
    })
  })
})
app.use(express.static(path.join(_dirname,
server.llisten(port,()=>{
  console.log('sever listen on port',port)
}))))