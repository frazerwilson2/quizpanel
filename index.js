const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const session = require("express-session");

const app = express();
const server = createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
    secret: "changeit",
    resave: true,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});  

app.get('/admin', (req, res) => {
    res.sendFile(join(__dirname, 'admin.html'));
});  

let users = {};

io.on('connection', (socket) => {
    console.log('a user connected', socket.request.session.id);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        var srvSockets = io.sockets.sockets;
        // srvSockets.forEach((value, key) => {
        //     if(!users.hasOwnProperty(key)){
        //         console.log(value);
        //         delete users[key];
        //     }
        // });
        // console.log({users});
        io.emit('userList', users)
    });
    socket.on('usr', (user) => {
        console.log(user);
        users[user.id] = {name:user.name, answers:{} }
        io.emit('userList', users)
    });
    socket.on('answers', (msg) => {
        console.log(msg);
        const newUsers = Object.assign({}, users);
        if(newUsers.hasOwnProperty(msg.id)){
            newUsers[msg.id].answers = msg.answers;
            users = newUsers;
            io.emit('userList', users)
        }
    });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});