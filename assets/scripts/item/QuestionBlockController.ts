import MushroomController from "./MushroomController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuestionBlockController extends cc.Component {
    @property(cc.Node)
    playerNode: cc.Node = null;

    @property(cc.Node)
    gameManagerNode: cc.Node = null;

    @property([cc.SpriteFrame])
    questionFrames: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    usedFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    mushroomFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    coinFrame: cc.SpriteFrame = null;

    @property
    blockType: number = 0;

    @property
    spawnOffsetY: number = 40;

    @property
    animationInterval: number = 0.3;

    private sprite: cc.Sprite = null;
    private hasUsed: boolean = false;
    private frameIndex: number = 0;
    private frameTimer: number = 0;

    onLoad(): void {
        this.sprite = this.getComponent(cc.Sprite);

        if (this.sprite && this.questionFrames.length > 0) {
            this.sprite.spriteFrame = this.questionFrames[0];
        }
    }

    update(dt: number): void {
        if (!this.hasUsed) {
            this.updateQuestionAnimation(dt);
            this.checkPlayerHitFromBelow();
        }
    }

    private updateQuestionAnimation(dt: number): void {
        if (!this.sprite || this.questionFrames.length === 0) {
            return;
        }

        this.frameTimer += dt;

        if (this.frameTimer < this.animationInterval) {
            return;
        }

        this.frameTimer = 0;
        this.frameIndex++;

        if (this.frameIndex >= this.questionFrames.length) {
            this.frameIndex = 0;
        }

        this.sprite.spriteFrame = this.questionFrames[this.frameIndex];
    }

    private checkPlayerHitFromBelow(): void {
        if (!this.playerNode) {
            return;
        }

        if (!this.isOverlapping(this.playerNode, this.node)) {
            return;
        }

        const playerRigidBody = this.playerNode.getComponent(cc.RigidBody);
        if (!playerRigidBody) {
            return;
        }

        const playerVelocityY = playerRigidBody.linearVelocity.y;
        const playerTop = this.playerNode.y + this.playerNode.height / 2;
        const blockBottom = this.node.y - this.node.height / 2;

        if (playerVelocityY > 0 && playerTop <= blockBottom + 26) {
            this.activateBlock(playerRigidBody);
        }
    }

    private activateBlock(playerRigidBody: cc.RigidBody): void {
        this.hasUsed = true;

        playerRigidBody.linearVelocity = cc.v2(playerRigidBody.linearVelocity.x, 0);

        if (this.sprite && this.usedFrame) {
            this.sprite.spriteFrame = this.usedFrame;
        }

        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;
            if (gameManager && gameManager.playPowerUpAppearSound) {
                gameManager.playPowerUpAppearSound();
            }
        }

        if (this.blockType === 1) {
            this.spawnCoin();
            return;
        }

        this.spawnMushroom();

        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;
            if (gameManager) {
                gameManager.addScore(100);
            }
        }
    }

    private spawnMushroom(): void {
        if (!this.mushroomFrame) {
            return;
        }

        const mushroomSize = 32;
        const blockTopY = this.node.y + this.node.height / 2;
        const blockRightX = this.node.x + this.node.width / 2;

        const mushroom = new cc.Node('Mushroom');
        mushroom.parent = this.node.parent;

        mushroom.setContentSize(mushroomSize, mushroomSize);
        mushroom.setPosition(this.node.x, blockTopY - mushroomSize / 2);

        const sprite = mushroom.addComponent(cc.Sprite);
        sprite.spriteFrame = this.mushroomFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        mushroom.setContentSize(mushroomSize, mushroomSize);

        mushroom.zIndex = this.node.zIndex - 1;

        const controller = mushroom.addComponent(MushroomController);
        controller.playerNode = this.playerNode;
        controller.gameManagerNode = this.gameManagerNode;
        controller.mushroomSize = mushroomSize;
        controller.blockTopY = blockTopY;
        controller.blockRightX = blockRightX;
        controller.blockZIndex = this.node.zIndex;
        controller.groundY = -243;

        cc.log('spawn mushroom size = ' + mushroom.width + ', ' + mushroom.height);
    }

    private spawnCoin(): void {
        if (!this.coinFrame) {
            return;
        }

        const coinSize = 40;
        const blockTopY = this.node.y + this.node.height / 2;

        const coin = new cc.Node('Coin');
        coin.parent = this.node.parent;

        coin.setContentSize(coinSize, coinSize);
        coin.setPosition(this.node.x, blockTopY + coinSize / 2);
        coin.zIndex = this.node.zIndex + 1;

        const sprite = coin.addComponent(cc.Sprite);
        sprite.spriteFrame = this.coinFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        coin.setContentSize(coinSize, coinSize);

        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;

            if (gameManager) {
                if (gameManager.addCoin) {
                    gameManager.addCoin(1);
                }

                if (gameManager.addScore) {
                    gameManager.addScore(100);
                }
            }
        }

        cc.tween(coin)
            .by(0.2, { y: 70 })
            .delay(0.15)
            .to(0.15, { opacity: 0 })
            .call(() => {
                coin.destroy();
            })
            .start();
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