const { ccclass } = cc._decorator;

@ccclass
export default class GameSession extends cc.Component {
    public static instance: GameSession = null;

    public life: number = 3;
    public score: number = 0;
    public coin: number = 0;
    public selectedLevel: string = 'Level1';

    onLoad(): void {
        if (GameSession.instance && GameSession.instance !== this) {
            this.node.destroy();
            return;
        }

        GameSession.instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    public resetForNewGame(): void {
        this.life = 3;
        this.score = 0;
        this.coin = 0;
        this.selectedLevel = 'Level1';
    }

    public loseLife(): void {
        this.life--;
    }

    public addScore(value: number): void {
        this.score += value;
    }

    public addCoin(value: number): void {
        this.coin += value;
    }
}