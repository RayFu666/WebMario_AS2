// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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