const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraUIFollower extends cc.Component {
    @property(cc.Node)
    cameraNode: cc.Node = null;

    update(): void {
        if (!this.cameraNode) {
            return;
        }

        this.node.setPosition(this.cameraNode.x, this.cameraNode.y);
    }
}