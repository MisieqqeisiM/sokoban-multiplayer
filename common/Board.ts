import { serialize } from "v8";

export enum TileType {
    NONE,
    FLOOR,
    TARGET,
    WALL,
}

export type Position = {
    x: number,
    y: number,
}

export type Offset =
    | { x: 1, y: 0 }
    | { x: -1, y: 0 }
    | { x: 0, y: 1 }
    | { x: 0, y: -1 }

class Tile {
    readonly type: TileType;
    public content: (BoardEntity | null);

    constructor(type: TileType, content: (BoardEntity | null) = null) {
        this.type = type;
        this.content = content;
    }

    isEmpty() {
        return (this.type === TileType.FLOOR || this.type === TileType.TARGET) && this.content === null;
    }

    tryPush(offset: Offset) {
        if (this.type === TileType.NONE || this.type === TileType.WALL)
            return false;
        if (this.content === null)
            return true;
        return this.content.tryPush(offset);
    }

    hasBox() {
        if (this.content === null)
            return false;
        return this.content.isBox();
    }

    clear() {
        this.content = null;
    }
}


export class StupidGenerator {
    generateBoard() {
        let playerX = 0, playerY = 0;
        let board = new Array<Array<TileType>>(10)
        let targetCount = 0
        for (let x = 0; x < 10; x++) {
            board[x] = new Array<TileType>(10)
            for (let y = 0; y < 10; y++) {
                board[x][y] = TileType.NONE;
                if (Math.random() < 0.8)
                    board[x][y] = TileType.FLOOR;
                if (Math.random() < 0.125 && targetCount < 2) { targetCount++; board[x][y] = TileType.TARGET }

                if (board[x][y] === TileType.FLOOR) {
                    playerX = x;
                    playerY = y;
                }

            }

        }
        return new Board(board, [{ x: playerX, y: playerY }], [{ x: 5, y: 5 }, { x: 6, y: 6 }]);
    }
}

export class TutorialGenerator {
    generateBoard() {
        let board = new Array(3)
        for (let x = 0; x < 3; x++) {
            board[x] = new Array(3)
            for (let y = 0; y < 3; y++) {
                board[x][y] = new Tile(TileType.FLOOR)
            }
        }
        board[2][2].type = TileType.TARGET;
        return new Board(board, [{ x: 0, y: 0 }], [{ x: 1, y: 1 }])
    }

}

// export class NetworkGenerator {
//     generateBoard(data) {
//         let board = data.board.map(col => {
//             return col.map(tileData => {
//                 return new Tile(tileData.type)
//             })
//         })


//         let boxes = data.boxes.map(boxData => new Box(boxData.x, boxData.y))
//         let player = new Player(data.player.x, data.player.y)
//         return new Board(board, player, boxes)
//     }
// }


export type SerializedBoard = {
    board: TileType[][],
    players: Position[],
    boxes: Position[],
}
export class Board {
    private board: Tile[][];
    private boxes: Box[];
    private players: Player[];
    private targetTiles: Position[];
    constructor(board: TileType[][], playerCoords: Position[], boxCoords: Position[]) {
        this.board = board.map(col => col.map(tileType => new Tile(tileType)));
        this.players = playerCoords.map(position => new Player(position, this));
        this.boxes = boxCoords.map(position => new Box(position, this));

        this.targetTiles = []
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.height; y++)
                if (this.board[x][y].type === TileType.TARGET)
                    this.targetTiles.push({ x, y });


    }

    *createBoxObservers() {
        for (let box of this.boxes) {
            let observer = makeDefaultObserver();
            box.addObserver(observer);
            yield { observer, position: box.getPosition() };
        }
    }

    *createPlayerObservers() {
        for (let player of this.players) {
            let observer = makeDefaultObserver();
            player.addObserver(observer);
            yield { observer, position: player.getPosition() };
        }
    }

    public serialize() {
        return {
            board: this.board.map(col => col.map(tile => tile.type)),
            players: this.players.map(player => player.getPosition()),
            boxes: this.boxes.map(box => box.getPosition()),
        }
    }

    public get width() {
        return this.board.length
    }

    public get height() {
        return this.board[0].length
    }

    public contains(position: Position) {
        return 0 <= position.x && position.x < this.width && 0 <= position.y && position.y < this.height;
    }
    public tileTypeAt(position: Position) {
        return this.at(position).type;
    }

    public at(position: Position) {
        if (this.contains(position))
            return this.board[position.x][position.y]
        else
            return new Tile(TileType.NONE)
    }

    public forAllTiles(f: (position: Position, type: TileType) => void) {
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.width; y++) {
                const type = this.at({ x, y }).type;
                if (type !== TileType.NONE)
                    f({ x, y }, type);
            }

    }

    isEmpty(position: Position) {
        return this.at(position).isEmpty();
    }

    hasBox(position: Position) {
        return this.at(position).hasBox();
    }

    allTargetsSatisfied() {
        return this.targetTiles.every(position => this.at(position).hasBox());
    }
}



export type EntityObserver = {
    onEnter: (position: Position) => void,
    onLeave: (position: Position) => void,
}
abstract class BoardEntity {
    protected position: Position;
    protected board: Board;
    private observers: EntityObserver[];

    constructor(position: Position, board: Board) {
        this.position = position;
        this.board = board;
        this.board.at(position).content = this;
        this.observers = [];
    }

    public addObserver(observer: EntityObserver) {
        this.observers.push(observer);
    }

    public move(offset: Offset) {
        for (const observer of this.observers) observer.onLeave(this.position);
        this.board.at(this.position).clear();
        this.position = this.positionAfterPush(offset);
        this.board.at(this.position).content = this;
        for (const observer of this.observers) observer.onEnter(this.position);
    }
    public getPosition(): Position {
        return this.position;
    }

    protected positionAfterPush(offset: Offset) {
        return { x: this.position.x + offset.x, y: this.position.y + offset.y };
    }

    public abstract tryPush(offset: Offset): boolean;
    public abstract isBox(): void;
}

class Player extends BoardEntity {
    constructor(position: Position, board: Board) {
        super(position, board);
    }

    tryPush(offset: Offset) {
        return false;
    }

    isBox() {
        return false;
    }

    tryMove(offset: Offset) {
        if (!this.board.at(this.positionAfterPush(offset)).tryPush(offset))
            return false;
        this.move(offset);
        return true;
    }
}

class Box extends BoardEntity {
    constructor(position: Position, board: Board) {
        super(position, board);
    }


    tryPush(offset: Offset) {
        if (!this.board.at(this.positionAfterPush(offset)).isEmpty())
            return false;
        this.move(offset);
        return true;
    }

    isBox() {
        return true;
    }
}


function makeDefaultObserver() {
    return { onEnter: (position: Position) => { }, onLeave: (position: Position) => { } }
}