const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const users = {};

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('hello', (msg) => {
    users[msg.name] = {
      ...users[msg.name],
      isOnline: true
    };

    io.emit('hello', Object.entries(users).filter(([_, state]) => {
      return state.isOnline;
    }).map(([name, _]) => {
      return name;
    }).join('<br/>'));
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
