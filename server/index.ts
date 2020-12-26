import * as express from 'express';
import { Socket, Server} from 'socket.io';
import { Offset,  MultiplayerTutorialGenerator, PlayerController } from '../common/Board'

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('dist/public'));

const board = new MultiplayerTutorialGenerator().generateBoard();

let availablePlayers: PlayerController[] = [];
for(let i = 0; i < board.getPlayerCount(); i++) {
  availablePlayers.push(board.getPlayerController(i));
}

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  
  socket.emit('allData', board.serialize());
  
  if(availablePlayers.length > 0) {
    let controller = availablePlayers.pop()!;
    socket.on('move', (offset: Offset) => {
      if(controller.tryMove(offset))
        io.sockets.emit('stateChange', board.getState());
    });
    socket.on('disconnect', () => availablePlayers.push(controller));
  }
});


server.listen(25565, () => {
  console.log('listening on *:25565');
});