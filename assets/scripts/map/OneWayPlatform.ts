const { ccclass, property } = cc._decorator;

@ccclass
export default class OneWayPlatform extends cc.Component {
    @property
    topTolerance: number = 12;

    @property
    horizontalTolerance: number = 8;

    private playerNode: cc.Node = null;
    private collider: cc.PhysicsBoxCollider = null;
    private isSolid: boolean = false;

    onLoad(): void {
        this.collider = this.getComponent(cc.PhysicsBoxCollider);
        this.playerNode = this.findNodeByName(cc.director.getScene(), "Player");

        this.setSolid(false);
    }

    update(dt: number): void {
        if (!this.playerNode || !this.collider) {
            return;
        }

        const body = this.playerNode.getComponent(cc.RigidBody);
        if (!body) {
            this.setSolid(false);
            return;
        }

        const playerLeft = this.playerNode.x - this.playerNode.width / 2;
        const playerRight = this.playerNode.x + this.playerNode.width / 2;
        const playerBottom = this.playerNode.y - this.playerNode.height / 2;

        const platformLeft = this.node.x - this.node.width / 2;
        const platformRight = this.node.x + this.node.width / 2;
        const platformTop = this.node.y + this.node.height / 2;

        const horizontalOverlap =
            playerRight > platformLeft + this.horizontalTolerance &&
            playerLeft < platformRight - this.horizontalTolerance;

        const playerIsAbove =
            playerBottom >= platformTop - this.topTolerance;

        const fallingOrStanding =
            body.linearVelocity.y <= 5;

        if (horizontalOverlap && playerIsAbove && fallingOrStanding) {
            this.setSolid(true);
        } else {
            this.setSolid(false);
        }
    }

    private setSolid(value: boolean): void {
        if (!this.collider) {
            return;
        }

        if (this.isSolid === value) {
            return;
        }

        this.isSolid = value;
        this.collider.sensor = !value;
        this.collider.apply();
    }

    private findNodeByName(root: cc.Node, name: string): cc.Node {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.children.length; i++) {
            const found = this.findNodeByName(root.children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}