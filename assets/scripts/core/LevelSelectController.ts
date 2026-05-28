import GameSession from "./GameSession";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelectController extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    coinLabel: cc.Label = null;

    @property(cc.Label)
    lifeLabel: cc.Label = null;

    @property(cc.AudioClip)
    menuBGM: cc.AudioClip = null;

    @property
    menuBGMVolume: number = 0.5;

    @property
    defaultLife: number = 3;

    start(): void {
        this.ensureGameSession();
        this.playMenuBGM();
        this.updateUI();
    }

    private ensureGameSession(): void {
        if (GameSession.instance) {
            return;
        }

        const scene = cc.director.getScene();
        if (!scene) {
            return;
        }

        const sessionNode = new cc.Node('GameSession');
        scene.addChild(sessionNode);

        const session = sessionNode.addComponent(GameSession);
        session.resetForNewGame();
        session.selectedLevel = 'Level1';
    }

    private playMenuBGM(): void {
        if (!this.menuBGM) {
            return;
        }

        if (cc.audioEngine.isMusicPlaying()) {
            return;
        }

        cc.audioEngine.playMusic(this.menuBGM, true);
        cc.audioEngine.setMusicVolume(this.menuBGMVolume);
    }

    private stopMenuBGM(): void {
        cc.audioEngine.stopMusic();
    }

    private updateUI(): void {
        const score = GameSession.instance ? GameSession.instance.score : 0;
        const coin = GameSession.instance ? GameSession.instance.coin : 0;
        const life = GameSession.instance ? GameSession.instance.life : this.defaultLife;

        if (this.scoreLabel) {
            this.scoreLabel.string = this.padScore(score);
        }

        if (this.coinLabel) {
            this.coinLabel.string = '' + coin;
        }

        if (this.lifeLabel) {
            this.lifeLabel.string = '' + life;
        }
    }

    public loadStage1(): void {
        this.ensureGameSession();

        if (GameSession.instance) {
            GameSession.instance.selectedLevel = 'Level1';
        }

        this.stopMenuBGM();
        cc.director.loadScene('GameStart');
    }

    public loadStage2(): void {
        cc.log('Stage2 is not implemented yet.');
    }

    private padScore(value: number): string {
        let text = '' + value;

        while (text.length < 7) {
            text = '0' + text;
        }

        return text;
    }
}