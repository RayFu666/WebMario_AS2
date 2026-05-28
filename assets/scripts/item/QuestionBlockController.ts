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

    @property([cc.SpriteFrame])
    coinFrames: cc.SpriteFrame[] = [];

    @property(cc.BitmapFont)
    scoreFont: cc.BitmapFont = null;

    @property
    blockType: number = 0;

    @property
    spawnOffsetY: number = 40;

    @property
    animationInterval: number = 0.3;

    @property
    hitTolerance: number = 40;

    @property
    mushroomSize: number = 48;

    @property
    mushroomGroundY: number = -243;

    @property
    coinSize: number = 60;

    @property
    coinJumpHeight: number = 70;

    @property
    coinAnimInterval: number = 0.06;

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
        if (this.hasUsed) {
            return;
        }

        this.updateQuestionAnimation(dt);
        this.checkPlayerHitFromBelow();
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

        const playerRigidBody = this.playerNode.getComponent(cc.RigidBody);
        if (!playerRigidBody) {
            return;
        }

        const playerVelocityY = playerRigidBody.linearVelocity.y;
        if (playerVelocityY <= 0) {
            return;
        }

        const playerBox = this.playerNode.getBoundingBoxToWorld();
        const blockBox = this.node.getBoundingBoxToWorld();

        const playerTop = playerBox.y + playerBox.height;
        const blockBottom = blockBox.y;

        const playerCenterX = playerBox.x + playerBox.width / 2;
        const blockLeft = blockBox.x;
        const blockRight = blockBox.x + blockBox.width;

        const horizontalInside =
            playerCenterX >= blockLeft &&
            playerCenterX <= blockRight;

        const verticalHit =
            playerTop >= blockBottom - this.hitTolerance &&
            playerTop <= blockBottom + 6;

        if (horizontalInside && verticalHit) {
            this.activateBlock(playerRigidBody);
        }
    }

    private activateBlock(playerRigidBody: cc.RigidBody): void {
        this.hasUsed = true;

        playerRigidBody.linearVelocity = cc.v2(playerRigidBody.linearVelocity.x, 0);

        if (this.sprite && this.usedFrame) {
            this.sprite.spriteFrame = this.usedFrame;
        }

        this.playAppearSound();

        if (this.blockType === 1) {
            this.spawnCoin();
            this.addCoinAndScore();
            return;
        }

        this.spawnMushroom();
    }

    private spawnMushroom(): void {
        if (!this.mushroomFrame) {
            return;
        }

        const blockTopY = this.node.y + this.node.height / 2;
        const blockRightX = this.node.x + this.node.width / 2;

        const mushroom = new cc.Node('Mushroom');
        mushroom.parent = this.node.parent;

        mushroom.setContentSize(this.mushroomSize, this.mushroomSize);
        mushroom.setPosition(this.node.x, blockTopY - this.mushroomSize / 2);
        mushroom.zIndex = this.node.zIndex - 1;

        const sprite = mushroom.addComponent(cc.Sprite);
        sprite.spriteFrame = this.mushroomFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const controller = mushroom.addComponent(MushroomController);
        controller.playerNode = this.playerNode;
        controller.gameManagerNode = this.gameManagerNode;
        controller.mushroomSize = this.mushroomSize;
        controller.blockTopY = blockTopY;
        controller.blockRightX = blockRightX;
        controller.blockZIndex = this.node.zIndex;
        controller.groundY = this.mushroomGroundY;
    }

    private spawnCoin(): void {
        if (!this.coinFrames || this.coinFrames.length === 0) {
            return;
        }

        const blockTopY = this.node.y + this.node.height / 2;
        const startY = blockTopY - this.coinSize / 2;
        const visibleY = blockTopY + this.coinSize / 2;
        const topY = visibleY + this.coinJumpHeight;

        const coin = new cc.Node('Coin');
        coin.parent = this.node.parent;

        coin.setContentSize(this.coinSize, this.coinSize);
        coin.setPosition(this.node.x, startY);
        coin.zIndex = this.node.zIndex - 1;

        const sprite = coin.addComponent(cc.Sprite);
        sprite.spriteFrame = this.coinFrames[0];
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        coin.setContentSize(this.coinSize, this.coinSize);

        this.scheduleOnce(() => {
            if (coin && coin.isValid) {
                coin.zIndex = this.node.zIndex + 1;
            }
        }, 0.08);

        this.playCoinFrameAnimation(sprite);

        cc.tween(coin)
            .to(0.18, { y: topY })
            .to(0.22, { y: visibleY })
            .call(() => {
                const textX = coin.x;
                const textY = coin.y;
                coin.destroy();
                this.spawnScoreText(textX, textY);
            })
            .start();
    }

    private playCoinFrameAnimation(sprite: cc.Sprite): void {
        if (!sprite || !this.coinFrames || this.coinFrames.length < 3) {
            return;
        }

        cc.tween(sprite)
            .call(() => { sprite.spriteFrame = this.coinFrames[0]; })
            .delay(this.coinAnimInterval)
            .call(() => { sprite.spriteFrame = this.coinFrames[1]; })
            .delay(this.coinAnimInterval)
            .call(() => { sprite.spriteFrame = this.coinFrames[2]; })
            .delay(this.coinAnimInterval)
            .call(() => { sprite.spriteFrame = this.coinFrames[1]; })
            .delay(this.coinAnimInterval)
            .call(() => { sprite.spriteFrame = this.coinFrames[0]; })
            .start();
    }

    private spawnScoreText(x: number, y: number): void {
        const scoreNode = new cc.Node('Score100');
        scoreNode.parent = this.node.parent;
        scoreNode.setPosition(x, y);
        scoreNode.zIndex = this.node.zIndex + 2;

        const label = scoreNode.addComponent(cc.Label);
        label.string = '100';
        label.fontSize = 48;
        label.lineHeight = 48;

        if (this.scoreFont) {
            label.font = this.scoreFont;
        }

        cc.tween(scoreNode)
            .by(0.35, { y: this.coinJumpHeight })
            .to(0.15, { opacity: 0 })
            .call(() => {
                scoreNode.destroy();
            })
            .start();
    }

    private playAppearSound(): void {
        if (!this.gameManagerNode) {
            return;
        }

        const gameManager = this.gameManagerNode.getComponent('GameManager') as any;

        if (gameManager && gameManager.playPowerUpAppearSound) {
            gameManager.playPowerUpAppearSound();
        }
    }

    private addScore(value: number): void {
        if (!this.gameManagerNode) {
            return;
        }

        const gameManager = this.gameManagerNode.getComponent('GameManager') as any;

        if (gameManager && gameManager.addScore) {
            gameManager.addScore(value);
        }
    }

    private addCoinAndScore(): void {
        if (!this.gameManagerNode) {
            return;
        }

        const gameManager = this.gameManagerNode.getComponent('GameManager') as any;

        if (!gameManager) {
            return;
        }

        if (gameManager.addCoin) {
            gameManager.addCoin(1);
        }

        if (gameManager.addScore) {
            gameManager.addScore(100);
        }
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