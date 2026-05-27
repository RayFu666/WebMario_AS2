import GameSession from "./GameSession";

const { ccclass } = cc._decorator;

@ccclass
export default class SceneLoader extends cc.Component {
    public loadStart(): void {
        cc.director.loadScene('Start');
    }

    public loadLevelSelect(): void {
        cc.director.loadScene('LevelSelect');
    }

    public loadLevel1(): void {
        if (GameSession.instance) {
            GameSession.instance.resetForNewGame();
            GameSession.instance.selectedLevel = 'Level1';
        }

        cc.director.loadScene('GameStart');
    }

    public loadGameOver(): void {
        cc.director.loadScene('GameOver');
    }
}