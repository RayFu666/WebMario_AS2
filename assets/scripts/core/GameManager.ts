const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Label)
    lifeLabel: cc.Label = null;

    @property
    maxLife: number = 3;

    @property
    fallLimitY: number = -450;

    private currentLife: number = 3;
    private playerStartPos: cc.Vec2 = cc.v2(0, 0);

    start(): void {
        this.currentLife = this.maxLife;

        if (this.player) {
            this.playerStartPos = cc.v2(this.player.x, this.player.y);
        }

        this.updateLifeUI();
    }

    update(): void {
        if (!this.player) {
            return;
        }

        if (this.player.y < this.fallLimitY) {
            this.playerDie();
        }
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

    private updateLifeUI(): void {
        if (this.lifeLabel) {
            this.lifeLabel.string = 'x ' + this.currentLife;
        }
    }
}