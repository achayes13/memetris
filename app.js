require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Game = require('./game/Game');
const Controller = require('./server/Controller');
const Spectator = require('./server/Spectator');

const PORT = process.env.PORT || 5001;
const GAMES = Number(process.env.GAMES || 1);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app
  .use('/play', express.static('views/index.html'))
  .use('/spectate', express.static('views/index.html'))
  .get('/', (req, res, next) => res.redirect('/play'))
  .use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server started on localhost:${PORT}`));

const clientConfig = {
  debugControls: process.env.DEBUG_CONTROLS === 'true',
  showAds: process.env.SHOW_ADS === 'true',
  games: GAMES,
};

var seed = Math.random();
const games = Array(GAMES)
  .fill(0)
  .map((_, i) => new Game(`t${i + 1}`, seed));

const controller = new Controller(games);
const spectator = new Spectator(games);

games.forEach(game => {
  const otherGames = games.filter(x => x !== game);
  game.setListener(() => spectator.update(game));
  game.setNewGameListener((newSeed) => otherGames.forEach(x => x.restart(seed)));
  game.setGarbageListener(c => otherGames.forEach(x => x.garbage(c)));
});

io.on('connect', socket => {
  socket.on('requestbutton', () => controller.connect(socket));
  socket.on('requestgamestate', name => spectator.connect(socket, name));

  socket.on('requestconfig', () => socket.emit('config', clientConfig));

  games.forEach(game => {
    socket.on(`${game.name()}-a`, () => game.a());
    socket.on(`${game.name()}-left`, () => game.left());
    socket.on(`${game.name()}-right`, () => game.right());
    socket.on(`${game.name()}-down`, () => game.down());
  });

  socket.on('disconnect', () => {
    controller.disconnect(socket);
    spectator.disconnect(socket);
  });
});
