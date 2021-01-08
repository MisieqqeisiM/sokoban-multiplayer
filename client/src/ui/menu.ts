import mainMenuHTML from "./html/MainMenu.html"
import difficultyMenuHTML from "./html/DifficultyMenu.html"


export type MainMenuControls = {
    onPlayByDifficulty: () => void,
    onPlayAllLevels: () => void,
    onLevelEditor: () => void,
    onMultiplayer: () => void,
}

export type DifficultyMenuControls = {
    mainMenu: () => void,
    onEasy: () => void,
    onMedium: () => void,
    onHard: () => void,
}


export class MainMenu {
    element: ChildNode;
    constructor(controls: MainMenuControls) {
        let div = document.createElement('div');
        div.innerHTML = mainMenuHTML.trim();
        div.querySelector('#play-by-difficulty-btn')!.addEventListener('click', controls.onPlayByDifficulty);
        div.querySelector('#play-all-levels-btn')!.addEventListener('click', controls.onPlayAllLevels);
        div.querySelector('#level-editor-btn')!.addEventListener('click', controls.onLevelEditor);
        div.querySelector('#multiplayer-btn')!.addEventListener('click', controls.onMultiplayer);
        this.element = div.firstChild!;
    }
    remove() {
        this.element.remove();
    }
    appendTo(node: Node) {
        node.appendChild(this.element);
    }
}

export class DifficultyMenu {
    element: ChildNode;
    constructor(controls: DifficultyMenuControls) {
        let div = document.createElement('div');
        div.innerHTML = difficultyMenuHTML.trim();
        div.querySelector('#main-menu-btn')!.addEventListener('click', controls.mainMenu);
        div.querySelector('#easy-btn')!.addEventListener('click', controls.onEasy);
        div.querySelector('#medium-btn')!.addEventListener('click', controls.onMedium);
        div.querySelector('#hard-btn')!.addEventListener('click', controls.onHard);
        this.element = div.firstChild!;
    }
    remove() {
        this.element.remove();
    }
    appendTo(node: Node) {
        node.appendChild(this.element);
    }
}