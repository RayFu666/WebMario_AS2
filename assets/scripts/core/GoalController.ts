const { ccclass, property } = cc._decorator;

@ccclass
export default class GoalController extends cc.Component {
    @property(cc.Node)
    playerNode: cc.Node = null;

    @property(cc.Node)
    gameManagerNode: cc.Node = null;

    @property
    minMoveTimeBeforeStop: number = 0.7;

    private triggered: boolean = false;
    private stoppedOnGround: boolean = false;
    private clearElapsed: number = 0;
    private clearMoveSpeed: number = 0;

    update(dt: number) {
        if (this.triggered) {
            this.clearElapsed += dt;
            this.keepPlayerOriginalSpeedBeforeStop();
            this.stopPlayerAfterEnoughTimeAndLanding();
            return;
        }

        if (!this.playerNode) {
            return;
        }

        const playerBox = this.playerNode.getBoundingBoxToWorld();
        const goalBox = this.node.getBoundingBoxToWorld();

        if (playerBox.intersects(goalBox)) {
            this.triggerGoal();
        }
    }

    private triggerGoal() {
        if (this.triggered) {
            return;
        }

        this.triggered = true;
        this.stoppedOnGround = false;
        this.clearElapsed = 0;

        this.recordPlayerMoveSpeed();
        this.disablePlayerControl();
        this.keepPlayerOriginalSpeedBeforeStop();

        if (!this.gameManagerNode) {
            return;
        }

        const gameManager = this.gameManagerNode.getComponent('GameManager') as any;

        if (gameManager && gameManager.levelClear) {
            gameManager.levelClear();
        }
    }

    private recordPlayerMoveSpeed(): void {
        this.clearMoveSpeed = 0;

        if (!this.playerNode) {
            return;
        }

        const body = this.playerNode.getComponent(cc.RigidBody);

        if (!body) {
            return;
        }

        if (body.linearVelocity.x > 20) {
            this.clearMoveSpeed = body.linearVelocity.x;
            return;
        }

        this.clearMoveSpeed = 260;
    }

    private disablePlayerControl(): void {
        if (!this.playerNode) {
            return;
        }

        const playerController = this.playerNode.getComponent('PlayerController') as any;

        if (playerController) {
            playerController.enabled = false;
        }
    }

    private keepPlayerOriginalSpeedBeforeStop(): void {
        if (this.stoppedOnGround) {
            return;
        }

        if (!this.playerNode) {
            return;
        }

        const body = this.playerNode.getComponent(cc.RigidBody);

        if (!body) {
            return;
        }

        body.linearVelocity = cc.v2(this.clearMoveSpeed, body.linearVelocity.y);
    }

    private stopPlayerAfterEnoughTimeAndLanding(): void {
        if (this.stoppedOnGround) {
            return;
        }

        if (!this.playerNode) {
            return;
        }

        if (this.clearElapsed < this.minMoveTimeBeforeStop) {
            return;
        }

        const body = this.playerNode.getComponent(cc.RigidBody);

        if (!body) {
            return;
        }

        if (Math.abs(body.linearVelocity.y) <= 1) {
            body.linearVelocity = cc.v2(0, 0);
            body.angularVelocity = 0;

            const playerController = this.playerNode.getComponent('PlayerController') as any;
            if (playerController && playerController.showIdleFrame) {
                playerController.showIdleFrame();
            }

            this.stoppedOnGround = true;
        }
    }
}