import GameSession from "./GameSession";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStartController extends cc.Component {
    @property
    delaySeconds: number = 2.5;

    start(): void {
        window.setTimeout(() => {
            const targetScene = GameSession.instance ? GameSession.instance.selectedLevel : 'Level1';
            cc.director.loadScene(targetScene);
        }, this.delaySeconds * 1000);
    }
}