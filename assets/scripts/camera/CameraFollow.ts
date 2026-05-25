const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;

    @property
    leftBoundary: number = -480;

    @property
    rightBoundary: number = 1600;

    @property
    viewHalfWidth: number = 480;

    @property
    followSpeed: number = 8;

    update(dt: number): void {
        if (!this.target) {
            return;
        }

        let targetX = this.target.x;

        const minX = this.leftBoundary + this.viewHalfWidth;
        const maxX = this.rightBoundary - this.viewHalfWidth;

        if (minX <= maxX) {
            if (targetX < minX) {
                targetX = minX;
            }

            if (targetX > maxX) {
                targetX = maxX;
            }
        } else {
            targetX = (this.leftBoundary + this.rightBoundary) / 2;
        }

        const currentPos = this.node.position;
        const newX = currentPos.x + (targetX - currentPos.x) * this.followSpeed * dt;

        this.node.setPosition(newX, currentPos.y);
    }
}