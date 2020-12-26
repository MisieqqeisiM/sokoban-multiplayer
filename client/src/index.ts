import io from 'socket.io-client';
import { Offset, Board, SerializedBoard, BoardState } from '../../common/Board'
import '../styles/main.css';
import { HTMLBoard } from './ui/BoardUI';

import "./ui/menu"

class GameState {
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }
  changeGameState(nextState: GameState) {
    this.game.state = nextState;
  }
}
class Game {
  gameWrapper: HTMLElement;
  state: GameState;
  constructor(gameWrapper: HTMLElement) {
    this.gameWrapper = gameWrapper;
  }
}

class MainMenu extends GameState {
  constructor(game: Game) {
    super(game);
  }

}

const socket = io();

socket.on('allData', (data: any) => init(data));


let board: (Board | null) = null;
let boardUI: (HTMLBoard | null) = null;

function init(data: SerializedBoard) {
  if (boardUI !== null)
    boardUI.element.remove();
  socket.off('stateChange');

  board = new Board(data.board, data.players, data.boxes);
  boardUI = new HTMLBoard(board);
  document.getElementById("game-wrapper")!.append(boardUI.element);

  socket.on('stateChange', (state: BoardState) => {
    board!.setState(state);
  })
}

document.addEventListener('keydown', (e) => {
  let offset: (Offset | null) = null;
  if (e.code === 'KeyW')
    offset = { x: 0, y: -1 };
  else if (e.code === 'KeyA')
    offset = { x: -1, y: 0 };
  else if (e.code === 'KeyS')
    offset = { x: 0, y: 1 };
  else if (e.code === 'KeyD')
    offset = { x: 1, y: 0 };

  if (offset !== null)
    socket.emit('move', offset);
})