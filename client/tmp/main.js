import { NetworkGenerator } from './Board.js'
import { BoardUI } from './BoardUI.js'
import {io} from 'socket.io-client'
const socket = io()

let gameWrapper = document.getElementById("game-wrapper")
let board, boardUI;
socket.on("allData", (data) => {
    console.log(data)

    board = new NetworkGenerator().generateBoard(data)

    if(boardUI !== undefined)
        boardUI.element.remove()
    boardUI = new BoardUI(board)
    gameWrapper.append(boardUI.element)

})



const Actions = {
    MOVE_LEFT: 0,
    MOVE_RIGHT: 1,
    MOVE_UP: 2,
    MOVE_DOWN: 3,
}

let actionQueue = []

document.getElementById("btn-restart").addEventListener("click", () => newGame())
document.getElementById("btn-next").addEventListener("click", () => newGame())
function newGame() {
    boardUI.element.remove();
    board = boardGenerator.generateBoard()
    boardUI = new BoardUI(board)
    gameWrapper.append(boardUI.element)
    actionQueue = []

}

function movePlayer(action) {
    socket.emit("move", action)
    if (action === Actions.MOVE_LEFT)
        return board.movePlayer(-1, 0)
    else if (action === Actions.MOVE_RIGHT)
        return board.movePlayer(1, 0)
    else if (action === Actions.MOVE_UP)
        return board.movePlayer(0, -1)
    else if (action === Actions.MOVE_DOWN)
        return board.movePlayer(0, 1)
}

let canApplyMoveInstantly = true

function applyAction(action) {
    actionQueue.push(action)
    if (canApplyMoveInstantly) {
        nextQueuedAction()
    }
}

function nextQueuedAction() {

    if (actionQueue.length === 0) {
        canApplyMoveInstantly = true
        return
    }
    canApplyMoveInstantly = false
    while (actionQueue.length > 0 && !movePlayer(actionQueue.shift()));
    setTimeout(() => nextQueuedAction(), 100)
}

document.addEventListener("keypress", (e) => {
    if (e.code == "KeyR")
        newGame()
    if (e.code === "KeyA" || e.code === "KeyH")
        applyAction(Actions.MOVE_LEFT)
    else if (e.code === "KeyD" || e.code === "KeyL")
        applyAction(Actions.MOVE_RIGHT)
    else if (e.code === "KeyW" || e.code === "KeyK")
        applyAction(Actions.MOVE_UP)
    else if (e.code === "KeyS" || e.code === "KeyJ")
        applyAction(Actions.MOVE_DOWN)
})

