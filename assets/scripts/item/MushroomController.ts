import PlayerController from "../player/PlayerController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MushroomController extends cc.Component {
    @property
    moveSpeed: number = 90;

    @property
    emergeSpeed: number = 70;

    @property
    gravity: number = -900;

    @property
    groundY: number = -186;

    @property
    mushroomSize: number = 56;

    @property
    blockTopY: number = 0;

    @property
    blockRightX: number = 0;

    @property
    blockZIndex: number = 0;

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property(cc.Node)
    gameManagerNode: cc.Node = null;

    private moveDir: number = 1;
    private velocityY: number = 0;
    private state: number = 0;

    update(dt: number): void {
        this.forceVisualSize();

        if (this.state === 0) {
            this.updateEmerging(dt);
        } else if (this.state === 1) {
            this.updateWalkOnBlock(dt);
        } else {
            this.updateFallingAndWalking(dt);
        }

        this.checkPlayerCollect();
    }

    private forceVisualSize(): void {
        this.node.setContentSize(this.mushroomSize, this.mushroomSize);

        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
    }

    private updateEmerging(dt: number): void {
        const targetY = this.blockTopY + this.mushroomSize / 2;

        this.node.y += this.emergeSpeed * dt;

        if (this.node.y >= targetY) {
            this.node.y = targetY;
            this.state = 1;
        }
    }

    private updateWalkOnBlock(dt: number): void {
        this.node.y = this.blockTopY + this.mushroomSize / 2;
        this.node.x += this.moveDir * this.moveSpeed * dt;

        const mushroomLeftX = this.node.x - this.mushroomSize / 2;

        if (mushroomLeftX >= this.blockRightX) {
            this.state = 2;
            this.velocityY = 0;
            this.node.zIndex = this.blockZIndex + 1;
        }
    }

    private updateFallingAndWalking(dt: number): void {
        this.node.x += this.moveDir * this.moveSpeed * dt;

        this.velocityY += this.gravity * dt;
        this.node.y += this.velocityY * dt;

        if (this.node.y <= this.groundY) {
            this.node.y = this.groundY;
            this.velocityY = 0;
        }
    }

    private checkPlayerCollect(): void {
        if (this.state !== 2) {
            return;
        }

        if (!this.playerNode) {
            return;
        }

        if (!this.isOverlapping(this.node, this.playerNode)) {
            return;
        }

        const playerController = this.playerNode.getComponent(PlayerController);
        if (playerController) {
            playerController.becomeBig();
        }

        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;
            if (gameManager) {
                gameManager.addScore(1000);
            }
        }

        this.node.destroy();
    }

    private isOverlapping(a: cc.Node, b: cc.Node): boolean {
        const aLeft = a.x - a.width / 2;
        const aRight = a.x + a.width / 2;
        const aBottom = a.y - a.height / 2;
        const aTop = a.y + a.height / 2;

        const bLeft = b.x - b.width / 2;
        const bRight = b.x + b.width / 2;
        const bBottom = b.y - b.height / 2;
        const bTop = b.y + b.height / 2;

        return aLeft < bRight && aRight > bLeft && aBottom < bTop && aTop > bBottom;
    }
}