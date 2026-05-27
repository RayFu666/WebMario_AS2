const { ccclass, property } = cc._decorator;

@ccclass
export default class GoalController extends cc.Component {
    @property(cc.Node)
    playerNode: cc.Node = null;

    @property
    delaySeconds: number = 1.5;

    private triggered: boolean = false;

    update(dt: number) {
        if (this.triggered) {
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

        this.scheduleOnce(() => {
            cc.director.loadScene("LevelSelect");
        }, this.delaySeconds);
    }
}