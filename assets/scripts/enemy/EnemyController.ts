const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyController extends cc.Component {
    @property
    moveSpeed: number = 50;

    @property
    patrolLeftX: number = 100;

    @property
    patrolRightX: number = 500;

    @property
    stompBounceSpeed: number = 320;

    @property
    squashDuration: number = 0.25;

    @property
    walkFlipInterval: number = 0.25;

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property(cc.Node)
    gameManagerNode: cc.Node = null;

    @property(cc.SpriteFrame)
    goombaNormalFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    goombaSquashedFrame: cc.SpriteFrame = null;

    private rigidBody: cc.RigidBody = null;
    private sprite: cc.Sprite = null;
    private moveDir: number = -1;
    private isDead: boolean = false;
    private walkTimer: number = 0;
    private hurtCooldown: number = 0;

    onLoad(): void {
        this.rigidBody = this.getComponent(cc.RigidBody);
        this.sprite = this.getComponent(cc.Sprite);

        if (this.sprite && this.goombaNormalFrame) {
            this.sprite.spriteFrame = this.goombaNormalFrame;
        }
    }

    update(dt: number): void {
        if (this.isDead) {
            return;
        }

        this.updatePatrol();
        this.updateWalkAnimation(dt);
        this.updateHurtCooldown(dt);
        this.checkPlayerCollision();
    }

    private updatePatrol(): void {
        if (!this.rigidBody) {
            return;
        }

        if (this.node.x <= this.patrolLeftX) {
            this.moveDir = 1;
        } else if (this.node.x >= this.patrolRightX) {
            this.moveDir = -1;
        }

        const velocity = this.rigidBody.linearVelocity;
        velocity.x = this.moveDir * this.moveSpeed;
        this.rigidBody.linearVelocity = velocity;
    }

    private updateWalkAnimation(dt: number): void {
        this.walkTimer += dt;

        if (this.walkTimer < this.walkFlipInterval) {
            return;
        }

        this.walkTimer = 0;

        if (this.node.scaleX > 0) {
            this.node.scaleX = -1;
        } else {
            this.node.scaleX = 1;
        }
    }

    private updateHurtCooldown(dt: number): void {
        if (this.hurtCooldown > 0) {
            this.hurtCooldown -= dt;
        }
    }

    private checkPlayerCollision(): void {
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
        const playerBottom = this.playerNode.y - this.playerNode.height / 2;
        const enemyCenterY = this.node.y;

        if (playerVelocityY < 0 && playerBottom > enemyCenterY) {
            this.dieByStomp();
            return;
        }

        if (this.hurtCooldown <= 0) {
            this.hurtPlayer();
            this.hurtCooldown = 0.5;
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

    private dieByStomp(): void {
        this.isDead = true;

        if (this.rigidBody) {
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            this.rigidBody.type = cc.RigidBodyType.Static;
        }

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (collider) {
            collider.enabled = false;
        }

        if (this.sprite && this.goombaSquashedFrame) {
            this.sprite.spriteFrame = this.goombaSquashedFrame;
        }

        this.node.scaleX = 1;

        const playerRigidBody = this.playerNode.getComponent(cc.RigidBody);
        if (playerRigidBody) {
            const velocity = playerRigidBody.linearVelocity;
            velocity.y = this.stompBounceSpeed;
            playerRigidBody.linearVelocity = velocity;
        }

        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;
            if (gameManager) {
                gameManager.addScore(100);

                if (gameManager.playKickSound) {
                    gameManager.playKickSound();
                }
            }
        }

        this.scheduleOnce(function () {
            this.node.destroy();
        }, this.squashDuration);
    }

    private hurtPlayer(): void {
        if (this.gameManagerNode) {
            const gameManager = this.gameManagerNode.getComponent('GameManager') as any;
            if (gameManager) {
                gameManager.playerDie();
            }
        }
    }
}