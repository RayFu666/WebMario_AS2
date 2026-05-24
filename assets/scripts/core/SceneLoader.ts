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
        cc.director.loadScene('Level1');
    }

    public loadGameOver(): void {
        cc.director.loadScene('GameOver');
    }
}