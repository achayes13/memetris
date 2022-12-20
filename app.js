const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Game = require('./game/Game');
const Controller = require('./game/Controller');

const PORT = process.env.PORT || 5001;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app
  .use('/play', express.static('views/index.html'))
  .use('/spectate', express.static('views/index.html'))
  .get('/', (req, res, next) => res.redirect('/play'))
  .use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server started on localhost:${PORT}`));

const onChange = () =>
  io.emit('gamestate', {
    game1: game1?.state(),
    game2: game2?.state(),
    controller: controller?.state(),
  });
var seed = Math.random();
const game1 = new Game(seed);
game1.setListener(onChange);

const game2 = new Game(seed);
game2.setListener(onChange);

game1.setNewGameListener(() => game2.restart());
game2.setNewGameListener(() => game1.restart());

game1.setGarbageListener(c => game2.garbage(c));
game2.setGarbageListener(c => game1.garbage(c));

const controller = new Controller();
controller.setListener(onChange);

io.on('connection', socket => {
  socket.on('requestbutton', () => controller.connect(socket));
  socket.on('disconnect', () => controller.disconnect(socket));

  socket.on('t1-a', () => game1.a());
  socket.on('t1-left', () => game1.left());
  socket.on('t1-right', () => game1.right());
  socket.on('t1-down', () => game1.down());
  socket.on('t1-up', () => game1.up());

  socket.on('t2-a', () => game2.a());
  socket.on('t2-left', () => game2.left());
  socket.on('t2-right', () => game2.right());
  socket.on('t2-down', () => game2.down());
  socket.on('t2-up', () => game2.up());
});
