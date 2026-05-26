const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Label)
    lifeLabel: cc.Label = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;

    @property(cc.Label)
    coinLabel: cc.Label = null;

    @property(cc.Node)
    audioManagerNode: cc.Node = null;

    @property
    maxLife: number = 3;

    @property
    fallLimitY: number = -450;

    @property
    startTime: number = 120;

    private currentLife: number = 3;
    private score: number = 0;
    private coin: number = 0;
    private timeLeft: number = 120;
    private timerAcc: number = 0;
    private playerStartPos: cc.Vec2 = cc.v2(0, 0);
    private isGameOver: boolean = false;

    start(): void {
        this.currentLife = this.maxLife;
        this.score = 0;
        this.coin = 0;
        this.timeLeft = this.startTime;
        this.timerAcc = 0;
        this.isGameOver = false;

        if (this.player) {
            this.playerStartPos = cc.v2(this.player.x, this.player.y);
        }

        this.updateAllUI();
    }

    update(dt: number): void {
        if (this.isGameOver) {
            return;
        }

        this.updateTimer(dt);
        this.checkPlayerFall();
    }

    public addScore(value: number): void {
        this.score += value;
        this.updateScoreUI();
    }

    public addCoin(value: number): void {
        this.coin += value;
        this.updateCoinUI();
    }

    public playerDie(): void {
        if (this.isGameOver) {
            return;
        }

        this.playDieSound();

        this.currentLife--;

        if (this.currentLife <= 0) {
            this.goToGameOver();
            return;
        }

        this.respawnPlayer();
        this.updateLifeUI();
    }

    private checkPlayerFall(): void {
        if (!this.player) {
            return;
        }

        if (this.player.y < this.fallLimitY) {
            this.playerDie();
        }
    }

    private respawnPlayer(): void {
        if (!this.player) {
            return;
        }

        this.player.setPosition(this.playerStartPos);

        const rigidBody = this.player.getComponent(cc.RigidBody);
        if (rigidBody) {
            rigidBody.linearVelocity = cc.v2(0, 0);
            rigidBody.angularVelocity = 0;
        }
    }

    private updateTimer(dt: number): void {
        this.timerAcc += dt;

        while (this.timerAcc >= 1) {
            this.timerAcc -= 1;

            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.updateTimerUI();
                this.goToGameOver();
                return;
            }

            this.updateTimerUI();
        }
    }

    private playDieSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playLoseOneLife();
            }
        }
    }
    public playPowerUpSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playPowerUp();
            }
        }
    }

    public playPowerDownSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playPowerDown();
            }
        }
    }

    public playPowerUpAppearSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playPowerUpAppear();
            }
        }
    }

    public playKickSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playKick();
            }
        }
    }

    private goToGameOver(): void {
        this.isGameOver = true;
        cc.director.loadScene('GameOver');
    }

    private updateAllUI(): void {
        this.updateLifeUI();
        this.updateScoreUI();
        this.updateTimerUI();
        this.updateCoinUI();
    }

    private updateLifeUI(): void {
        if (this.lifeLabel) {
            this.lifeLabel.string = '' + this.currentLife;
        }
    }

    private updateScoreUI(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = this.padScore(this.score);
        }
    }

    private updateTimerUI(): void {
        if (this.timerLabel) {
            this.timerLabel.string = '' + this.timeLeft;
        }
    }

    private updateCoinUI(): void {
        if (this.coinLabel) {
            this.coinLabel.string = '' + this.coin;
        }
    }

    private padScore(value: number): string {
        let text = '' + value;

        while (text.length < 7) {
            text = '0' + text;
        }

        return text;
    }
}