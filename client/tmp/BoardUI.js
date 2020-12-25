import { TileType } from './Board.js'

const TILE_SIZE = 40
const TILE_BORDER_SIZE = 0;
const buttonNext = document.getElementById("btn-next")
class SatisfactionCounter {
    constructor(totalBoxCount) {
        this.satisfiedBoxCount = 0
        this.totalBoxCount = totalBoxCount

        this.counter = document.getElementById("satisfaction-counter")
        this.satisfiedElement = document.getElementById("satisfied-box-count")
        this.totalElement = document.getElementById("total-box-count")
        this.totalElement.innerHTML = String(totalBoxCount)
        this.changeBy(0)
    }

    changeBy(what) {
        this.satisfiedBoxCount += what
        this.satisfiedElement.innerHTML = String(this.satisfiedBoxCount)

        if (this.satisfiedBoxCount == this.totalBoxCount)
            this.counter.classList.add("satisfied")
        else
            this.counter.classList.remove("satisfied")

    }
}

export class BoardUI {
    constructor(board) {
        this.board = board
        this.satisfactionCounter = new SatisfactionCounter(this.board.boxes.length)
        this.element = this.createBoard()
        this.element.append(this.createPlayer())
        for (let box of this.board.boxes)
            this.element.append(this.createBox(box))
    }

    createBoard() {
        let element = document.createElement("div")
        element.classList.add("game-board");
        element.style.width = String(this.board.width * TILE_SIZE) + "px"
        element.style.height = String(this.board.height * TILE_SIZE) + "px"

        this.tiles = new Array(this.board.width)
        for (let x = 0; x < this.tiles.length; x++) {
            this.tiles[x] = new Array(this.board.height)
        }
        let zindex = 0
        this.board.forAllTiles((x, y, type) => {
            let tile = this.createTile(x, y, type)
            // tile.style.zIndex = String(zindex)
            element.append(tile)
            zindex--
            this.tiles[x][y] = tile
        })
        return element
    }

    createPlayer() {
        let player = document.createElement("div")
        player.classList.add("player")
        this.setBoxDimensions(player, this.board.player.x, this.board.player.y)
        this.board.player.onEnter = (x, y) => this.setPosition(player, x, y)
        return player
    }


    createBox(box) {
        let boxTile = document.createElement("div")
        boxTile.classList.add("box")
        this.setBoxDimensions(boxTile, box.x, box.y)

        if (this.tiles[box.x][box.y] !== undefined) {
            this.tiles[box.x][box.y].classList.add("has-box")
            if (this.board.at(box.x, box.y).type == TileType.TARGET) {
                this.satisfactionCounter.changeBy(1)
                boxTile.classList.add("is-satisfied")

            }
        }
        box.onEnter = (x, y) => {
            this.setPosition(boxTile, x, y)
            if (this.board.at(x, y).type == TileType.TARGET) {
                this.satisfactionCounter.changeBy(1)
                boxTile.classList.add("is-satisfied")
            }
            this.tiles[x][y].classList.add("has-box")
            this.checkGameEnd()
        }

        box.onLeave = (x, y) => {
            this.tiles[x][y].classList.remove("has-box")
            if (this.board.at(x, y).type == TileType.TARGET) {
                this.satisfactionCounter.changeBy(-1)
                boxTile.classList.remove("is-satisfied")
            }
        }
        return boxTile
    }

    createTile(x, y, type) {
        let tile = document.createElement("div")
        tile.classList.add("tile")
        tile.classList.add(this.tileTypeToClass(type))
        this.setTileDimensions(tile, x, y)
        return tile
    }

    tileTypeToClass(type) {
        if (type === TileType.NONE)
            return 'tile-none';
        if (type === TileType.FLOOR)
            return 'tile-floor';
        if (type === TileType.WALL)
            return 'tile-wall';
        if (type === TileType.TARGET)
            return 'tile-target';
    }
    setBoxDimensions(box, x, y) {
        this.setDimensions(box, x, y)
    }

    setTileDimensions(tile, x, y) {
        tile.style.borderWidth = String(TILE_BORDER_SIZE) + "px"
        tile.style.width = String(TILE_SIZE + TILE_BORDER_SIZE) + "px"
        tile.style.height = String(1.5 * TILE_SIZE + TILE_BORDER_SIZE) + "px"
        this.setPosition(tile, x, y)
    }

    setDimensions(entity, x, y) {
        entity.style.width = String(TILE_SIZE + TILE_BORDER_SIZE) + "px"
        entity.style.height = String(TILE_SIZE + TILE_BORDER_SIZE) + "px"
        this.setPosition(entity, x, y)
    }

    setPosition(entity, x, y) {
        entity.style.left = String(x * TILE_SIZE) + "px"
        entity.style.top = String(y * TILE_SIZE) + "px"
    }

    checkGameEnd() {
        if (this.board.allTargetsSatisfied()) {
            buttonNext.classList.add("visible")
        }
        else {
            buttonNext.classList.remove("visible")
        }
    }

}
