import io from 'socket.io-client';
import { Board, SerializedBoard } from '../../common/Board'
import '../styles/main.css';
import { HTMLBoard } from './ui/BoardUI';

const socket = io();

socket.on('allData', (data: any) => init(data));

function init(data: SerializedBoard) {
  let board = new Board(data.board, data.players, data.boxes);
  let boardUI = new HTMLBoard(board);
  document.getElementById("game-wrapper")!.append(boardUI.element);
}