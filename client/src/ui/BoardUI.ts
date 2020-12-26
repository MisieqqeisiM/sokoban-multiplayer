import { TileType, Board, EntityObserver, Position } from '../../../common/Board'

const TILE_SIZE = 40
const TILE_BORDER_SIZE = 0;

function tileTypeToClassName(type: TileType): string {
  if (type === TileType.NONE)
    return 'tile-none';
  if (type === TileType.FLOOR)
    return 'tile-floor';
  if (type === TileType.WALL)
    return 'tile-wall';
  if (type === TileType.TARGET)
    return 'tile-target';
  return '';
}

function px(n: number) {
  return String(n) + "px";
}

interface BoardUI {
  // ???
}

export class HTMLBoard implements BoardUI {
  private board: Board;
  public element: HTMLElement;
  private tiles: HTMLElement[][];

  constructor(board: Board) {
    this.board = board
    this.element = this.createBoard()

    for (const player of this.board.createPlayerObservers())
      this.element.append(this.createPlayer(player))

    for (const box of this.board.createBoxObservers())
      this.element.append(this.createBox(box))
  }

  createBoard() {
    let element = document.createElement("div")
    element.classList.add("game-board");
    element.style.width = px(this.board.width * TILE_SIZE)
    element.style.height = px(this.board.height * TILE_SIZE)

    this.tiles = new Array(this.board.width)
    for (let x = 0; x < this.tiles.length; x++) {
      this.tiles[x] = new Array(this.board.height)
    }
    let zindex = 0
    this.board.forAllTiles(({ x, y }, type) => {
      let tile = this.createTile(x, y, type)
      // tile.style.zIndex = String(zindex)
      element.append(tile)
      zindex--
      this.tiles[x][y] = tile
    })
    return element
  }

  createPlayer(player: { observer: EntityObserver, position: Position }) {
    let playerTile = document.createElement("div")
    playerTile.classList.add("player")
    this.setBoxDimensions(playerTile, player.position.x, player.position.y);
    player.observer.onEnter = ({ x, y }) => this.setPosition(playerTile, x, y);
    return playerTile;
  }


  createBox(box: { observer: EntityObserver, position: Position }) {
    let boxTile = document.createElement("div")
    boxTile.classList.add("box")
    this.setBoxDimensions(boxTile, box.position.x, box.position.y);

    if (this.tiles[box.position.x][box.position.y] !== undefined) {
      this.tiles[box.position.x][box.position.y].classList.add("has-box")
      if (this.board.tileTypeAt(box.position) === TileType.TARGET)
        boxTile.classList.add("is-satisfied")
    }

    box.observer.onEnter = ({ x, y }) => {
      this.setPosition(boxTile, x, y);
      if (this.board.tileTypeAt({ x, y }) === TileType.TARGET)
        boxTile.classList.add("is-satisfied");
      this.tiles[x][y].classList.add("has-box");
    }

    box.observer.onLeave = ({ x, y }) => {
      this.tiles[x][y].classList.remove("has-box");
      if (this.board.tileTypeAt({ x, y }) === TileType.TARGET)
        boxTile.classList.remove("is-satisfied");
    }
    return boxTile
  }

  createTile(x: number, y: number, type: TileType) {
    let tile = document.createElement("div")
    tile.classList.add("tile")
    tile.classList.add(tileTypeToClassName(type))
    this.setTileDimensions(tile, x, y)
    return tile
  }

  setBoxDimensions(box: HTMLElement, x: number, y: number) {
    this.setDimensions(box, x, y)
  }

  setTileDimensions(tile: HTMLElement, x: number, y: number) {
    tile.style.borderWidth = px(TILE_BORDER_SIZE)
    tile.style.width = px(TILE_SIZE + TILE_BORDER_SIZE)
    tile.style.height = px(1.5 * TILE_SIZE + TILE_BORDER_SIZE)
    this.setPosition(tile, x, y)
  }

  setDimensions(entity: HTMLElement, x: number, y: number) {
    entity.style.width = px(TILE_SIZE + TILE_BORDER_SIZE)
    entity.style.height = px(TILE_SIZE + TILE_BORDER_SIZE)
    this.setPosition(entity, x, y)
  }

  setPosition(entity: HTMLElement, x: number, y: number) {
    entity.style.left = px(x * TILE_SIZE)
    entity.style.top = px(y * TILE_SIZE)
  }

}

class SatisfactionCounter {
  public satisfiedBoxCount: number;
  public totalBoxCount: number;

  public counter: HTMLElement;
  public satisfiedDisplay: HTMLElement;
  public totalDisplay: HTMLElement;

  constructor(totalBoxCount: number,
    counter: HTMLElement,
    satisfiedDisplay: HTMLElement,
    totalDisplay: HTMLElement,
  ) {
    this.satisfiedBoxCount = 0
    this.totalBoxCount = totalBoxCount
    this.counter = counter,
      this.satisfiedDisplay = satisfiedDisplay;
    this.totalDisplay = totalDisplay;
    this.display();
  }

  increment() {
    this.satisfiedBoxCount--;
    this.display();
  }

  decrement() {
    this.satisfiedBoxCount++;
    this.display();
  }

  display() {
    if (this.satisfied())
      this.counter.classList.add("satisfied")
    else
      this.counter.classList.remove("satisfied")
    this.totalDisplay.innerHTML = String(this.totalBoxCount)
  }

  satisfied() {
    return this.satisfiedBoxCount == this.totalBoxCount;
  }
}


function newSatisfactionCounter() {
  let counter = document.getElementById("satisfaction-counter")!
  let satisfiedDisplay = document.getElementById("satisfied-box-count")!
  let totalDisplay = document.getElementById("total-box-count")!
  return new SatisfactionCounter(0, counter, satisfiedDisplay, totalDisplay);
}

function observeBoxesSatifaction(board: Board, counter: SatisfactionCounter) {
  for (let box of board.createBoxObservers()) {
    box.observer.onEnter = (position) => {
      if (board.tileTypeAt(position) === TileType.TARGET)
        counter.increment()
    }
    box.observer.onLeave = (position) => {
      if (board.tileTypeAt(position) === TileType.TARGET)
        counter.decrement()
    }
  }
}