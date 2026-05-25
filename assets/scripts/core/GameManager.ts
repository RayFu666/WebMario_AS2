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

    @property
    maxLife: number = 3;

    @property
    fallLimitY: number = -450;

    @property
    startTime: number = 120;

    private currentLife: number = 3;
    private score: number = 0;
    private timeLeft: number = 120;
    private timerAcc: number = 0;
    private playerStartPos: cc.Vec2 = cc.v2(0, 0);

    start(): void {
        this.currentLife = this.maxLife;
        this.score = 0;
        this.timeLeft = this.startTime;
        this.timerAcc = 0;

        if (this.player) {
            this.playerStartPos = cc.v2(this.player.x, this.player.y);
        }

        this.updateLifeUI();
        this.updateScoreUI();
        this.updateTimerUI();
    }

    update(dt: number): void {
        if (!this.player) {
            return;
        }

        if (this.player.y < this.fallLimitY) {
            this.playerDie();
            return;
        }

        this.updateTimer(dt);
    }

    public addScore(value: number): void {
        this.score += value;
        this.updateScoreUI();
    }

    public playerDie(): void {
        this.currentLife--;

        if (this.currentLife <= 0) {
            cc.director.loadScene('GameOver');
            return;
        }

        this.respawnPlayer();
        this.updateLifeUI();
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

        if (this.timerAcc < 1) {
            return;
        }

        this.timerAcc = 0;
        this.timeLeft--;

        if (this.timeLeft <= 0) {
            cc.director.loadScene('GameOver');
            return;
        }

        this.updateTimerUI();
    }

    private updateLifeUI(): void {
        if (this.lifeLabel) {
            this.lifeLabel.string = 'x ' + this.currentLife;
        }
    }

    private updateScoreUI(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = 'Score: ' + this.score;
        }
    }

    private updateTimerUI(): void {
        if (this.timerLabel) {
            this.timerLabel.string = 'Time: ' + this.timeLeft;
        }
    }
}