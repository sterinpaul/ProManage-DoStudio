
let activeUsers = []

const socketConfig = (io)=>{
    io.on('connection',(socket)=>{
        console.log('a user connected:', socket.id);
        socket.on('joinRoom', (user, room) => {
            socket.join(room);
            activeUsers.push({ id: socket.id, user, room });
            io.to(room).emit('userList', activeUsers.filter(user => user.room === room));
          });
        
          socket.on('chatMessage', (msg) => {
            const user = activeUsers.find(user => user.id === socket.id);
            if (user) {
              socket.broadcast.to(user.room).emit('chatMessage', { user: user.username, messageData: msg });
            }
          });

        socket.on('disconnect',()=>{
            activeUsers = activeUsers.filter((user)=>user.id !== socket.id)
            io.emit("userList", activeUsers)
            console.log(`user disconnected: ${socket.id}`)
        })
    })
}

export default socketConfig