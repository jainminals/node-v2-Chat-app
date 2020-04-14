const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage,generateLocationMessage } = require('./util/messages')
const{addUser, removeUser, getUser, getUsersInRoom} = require('./util/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port =  3000 //process.env.PORT ||
const publicDirctoryPath =path.join(__dirname,'../public')
app.use(express.static(publicDirctoryPath))



io.on('connection' , (socket)=>{
    console.log('connection...')
    
//-------------------- Join room------------------------
    socket.on('join' , (option,callback) =>{
       const {error , user} = addUser({id:socket.id,...option})
       if(error){
            return callback(error)
       }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has join room`)) // send mesg to all connect expect how sending the msg
        io.to(user.room).emit('roomData' , {
            room: user.room,
             users:getUsersInRoom(user.room)
        })
        callback()
    })



    //socket.emit ,io.emit, socket.broadcast.emit
    //-- , io.to.emit , socket.broadcast.to.emit
//-------------Send Messgae--------------------------------
    socket.on('sendMessgae', (message,callback) =>{
    const user = getUser(socket.id)    
    const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })


//------------Send Location------------------------- 

    socket.on('sendLoction' ,(coords,callback) =>{
        const user = getUser(socket.id)    
        io.to(user.room).emit('loctionMessage',generateLocationMessage(user.username,`https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


//-------------------Disconnect user-------------------------------

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData' , {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    
})


server.listen(port , () =>{
    console.log(`server is up on port ${port}!`)
})