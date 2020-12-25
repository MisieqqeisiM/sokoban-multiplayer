import * as express from 'express';
import { Socket } from 'socket.io';
import { StupidGenerator } from '../common/Board'

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('dist/public'));

const board = new StupidGenerator().generateBoard();

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.emit('allData', board.serialize());
  socket.on('disconnect', () => console.log('a user disconnected'));
});


server.listen(25565, () => {
  console.log('listening on *:25565');
});