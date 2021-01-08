import io from 'socket.io-client';
import { Offset, Board, SerializedBoard, BoardState, StupidGenerator } from '../../common/Board'
import '../styles/main.css';
import { BoardDisplay } from './ui/3DBoard';
import { HTMLBoard } from './ui/BoardUI';

import * as ui from "./ui/menu"

class GameState {
  protected game: Game;
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
    this.state = new MainMenu(this);
  }
}

class MainMenu extends GameState {
  menu: ui.MainMenu;
  constructor(game: Game) {
    super(game);
    let controls: ui.MainMenuControls = {
      onPlayByDifficulty: () => {
        this.menu.remove();
        this.changeGameState(new DifficultyMenu(game));
      },
      onPlayAllLevels: () => { },
      onLevelEditor: () => { },
      onMultiplayer: () => { },
    }
    this.menu = new ui.MainMenu(controls);
    this.menu.appendTo(game.gameWrapper);
  }
}

class DifficultyMenu extends GameState {
  menu: ui.DifficultyMenu;
  constructor(game: Game) {
    super(game);
    let controls: ui.DifficultyMenuControls = {
      mainMenu: () => {
        this.menu.remove();
        this.changeGameState(new MainMenu(game));
      },
      onEasy: () => {
        this.menu.remove();
        this.changeGameState(new GameBoard(game));
      },
      onMedium: () => { },
      onHard: () => { },
    }
    this.menu = new ui.DifficultyMenu(controls);
    this.menu.appendTo(game.gameWrapper);
  }
}

class GameBoard extends GameState {
  board: Board;
  constructor(game: Game) {
    super(game);
    this.board = new StupidGenerator().generateBoard(20, 20);
    new BoardDisplay(this.board);
  }
}


let game = new Game(document.getElementById('game-wrapper')!);