const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property
    moveSpeed: number = 260;

    @property
    airMoveSpeed: number = 160;

    @property
    jumpSpeed: number = 430;

    @property(cc.Node)
    audioManagerNode: cc.Node = null;

    @property(cc.SpriteFrame)
    smallMarioFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bigMarioFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    smallIdleFrame: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    smallWalkFrames: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    smallJumpFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    smallDeathFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bigIdleFrame: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    bigWalkFrames: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    bigJumpLowFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bigJumpHighFrame: cc.SpriteFrame = null;

    @property
    walkAnimationInterval: number = 0.12;

    @property
    bigJumpSwitchVelocity: number = 285;

    private rigidBody: cc.RigidBody = null;
    private sprite: cc.Sprite = null;
    private moveDir: number = 0;
    private isBig: boolean = false;
    private isDead: boolean = false;

    private smallWidth: number = 64;
    private smallHeight: number = 64;
    private smallColliderWidth: number = 44;
    private smallColliderHeight: number = 58;
    private smallColliderOffsetY: number = -3;

    private walkTimer: number = 0;
    private walkFrameIndex: number = 0;
    private jumpStartY: number = 0;
    private jumpKeyHeld: boolean = false;

    private deathVelocityY: number = 360;
    private deathGravity: number = -900;

    onLoad(): void {
        this.rigidBody = this.getComponent(cc.RigidBody);
        this.sprite = this.getComponent(cc.Sprite);

        if (this.sprite && !this.smallMarioFrame) {
            this.smallMarioFrame = this.sprite.spriteFrame;
        }

        if (!this.smallIdleFrame) {
            this.smallIdleFrame = this.smallMarioFrame;
        }

        if (!this.bigIdleFrame) {
            this.bigIdleFrame = this.bigMarioFrame;
        }

        this.focusGameCanvas();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy(): void {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(dt: number): void {
        if (this.isDead) {
            this.updateDeathAnimation(dt);
            return;
        }

        if (!this.rigidBody) {
            return;
        }
        const velocity = this.rigidBody.linearVelocity;
        const onGround = this.isOnGround();

        if (onGround) {
            velocity.x = this.moveDir * this.moveSpeed;
        } else {
            if (this.moveDir !== 0) {
                velocity.x = this.moveDir * this.airMoveSpeed;
            }
        }

        this.rigidBody.linearVelocity = velocity;

        if (this.moveDir < 0) {
            this.node.scaleX = -1;
        } else if (this.moveDir > 0) {
            this.node.scaleX = 1;
        }

        this.updateAnimation(dt, velocity, onGround);
    }

    public becomeBig(): void {
        if (this.isBig) {
            return;
        }

        this.isBig = true;

        const oldBottom = this.node.y - this.node.height / 2;

        if (this.sprite) {
            if (this.bigIdleFrame) {
                this.sprite.spriteFrame = this.bigIdleFrame;
            } else if (this.bigMarioFrame) {
                this.sprite.spriteFrame = this.bigMarioFrame;
            }
        }

        this.node.setContentSize(64, 116);
        this.node.y = oldBottom + this.node.height / 2;

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (collider) {
            collider.size = cc.size(44, 108);
            collider.offset = cc.v2(0, 0);
            collider.apply();
        }
    }

    public isBigMario(): boolean {
        return this.isBig;
    }

    public takeEnemyDamage(): boolean {
        if (this.isBig) {
            this.becomeSmall();
            return false;
        }

        return true;
    }

    public startDeathAnimation(): void {
        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.moveDir = 0;
        this.deathVelocityY = 360;

        if (this.sprite && !this.isBig && this.smallDeathFrame) {
            this.sprite.spriteFrame = this.smallDeathFrame;
        }

        if (this.rigidBody) {
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            this.rigidBody.angularVelocity = 0;
            this.rigidBody.type = cc.RigidBodyType.Static;
        }
    }

    public showIdleFrame(): void {
        if (!this.sprite) {
            return;
        }

        if (this.isBig) {
            if (this.bigIdleFrame) {
                this.sprite.spriteFrame = this.bigIdleFrame;
            }

            return;
        }

        if (this.smallIdleFrame) {
            this.sprite.spriteFrame = this.smallIdleFrame;
        }
    }

    private becomeSmall(): void {
        if (!this.isBig) {
            return;
        }

        this.isBig = false;

        const oldBottom = this.node.y - this.node.height / 2;

        if (this.sprite) {
            if (this.smallIdleFrame) {
                this.sprite.spriteFrame = this.smallIdleFrame;
            } else if (this.smallMarioFrame) {
                this.sprite.spriteFrame = this.smallMarioFrame;
            }
        }

        this.node.setContentSize(this.smallWidth, this.smallHeight);
        this.node.y = oldBottom + this.node.height / 2;

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (collider) {
            collider.size = cc.size(this.smallColliderWidth, this.smallColliderHeight);
            collider.offset = cc.v2(0, this.smallColliderOffsetY);
            collider.apply();
        }
    }

    private updateAnimation(dt: number, velocity: cc.Vec2, onGround: boolean): void {
        if (!this.sprite) {
            return;
        }

        if (!onGround) {
            this.updateJumpFrame(velocity);
            return;
        }

        if (Math.abs(velocity.x) > 5) {
            this.updateWalkFrame(dt);
            return;
        }

        this.updateIdleFrame();
    }

    private updateIdleFrame(): void {
        if (this.isBig) {
            if (this.bigIdleFrame) {
                this.sprite.spriteFrame = this.bigIdleFrame;
            }
        } else {
            if (this.smallIdleFrame) {
                this.sprite.spriteFrame = this.smallIdleFrame;
            }
        }

        this.walkTimer = 0;
        this.walkFrameIndex = 0;
    }

    private updateWalkFrame(dt: number): void {
        const frames = this.isBig ? this.bigWalkFrames : this.smallWalkFrames;

        if (!frames || frames.length === 0) {
            this.updateIdleFrame();
            return;
        }

        this.walkTimer += dt;

        if (this.walkTimer >= this.walkAnimationInterval) {
            this.walkTimer = 0;
            this.walkFrameIndex++;

            if (this.walkFrameIndex >= frames.length) {
                this.walkFrameIndex = 0;
            }
        }

        this.sprite.spriteFrame = frames[this.walkFrameIndex];
    }

    private updateJumpFrame(velocity: cc.Vec2): void {
        if (!this.isBig) {
            if (this.smallJumpFrame) {
                this.sprite.spriteFrame = this.smallJumpFrame;
            }

            return;
        }

        if (velocity.y > 0) {
            if (velocity.y > this.bigJumpSwitchVelocity) {
                if (this.bigJumpLowFrame) {
                    this.sprite.spriteFrame = this.bigJumpLowFrame;
                }
            } else {
                if (this.bigJumpHighFrame) {
                    this.sprite.spriteFrame = this.bigJumpHighFrame;
                }
            }

            return;
        }

        if (this.bigJumpLowFrame) {
            this.sprite.spriteFrame = this.bigJumpLowFrame;
        }
    }

    private updateDeathAnimation(dt: number): void {
        this.node.y += this.deathVelocityY * dt;
        this.deathVelocityY += this.deathGravity * dt;
    }

    private onKeyDown(event: cc.Event.EventKeyboard): void {
        if (this.isDead) {
            return;
        }

        if (event.keyCode === cc.macro.KEY.left || event.keyCode === cc.macro.KEY.a) {
            this.moveDir = -1;
        }

        if (event.keyCode === cc.macro.KEY.right || event.keyCode === cc.macro.KEY.d) {
            this.moveDir = 1;
        }

        if (event.keyCode === cc.macro.KEY.space) {
            if (!this.jumpKeyHeld) {
                this.jump();
            }

            this.jumpKeyHeld = true;
        }
    }

    private onKeyUp(event: cc.Event.EventKeyboard): void {
        if (this.isDead) {
            return;
        }

        if (
            event.keyCode === cc.macro.KEY.left ||
            event.keyCode === cc.macro.KEY.a ||
            event.keyCode === cc.macro.KEY.right ||
            event.keyCode === cc.macro.KEY.d
        ) {
            this.moveDir = 0;
        }

        if (event.keyCode === cc.macro.KEY.space) {
            this.jumpKeyHeld = false;
        }
    }

    private jump(): void {
        if (!this.rigidBody) {
            return;
        }

        if (!this.isOnGround()) {
            return;
        }

        const velocity = this.rigidBody.linearVelocity;
        velocity.y = this.jumpSpeed;
        this.rigidBody.linearVelocity = velocity;

        this.jumpStartY = this.node.y;

        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager) {
                audioManager.playJump();
            }
        }
    }
    

    private isOnGround(): boolean {
        if (!this.rigidBody) {
            return false;
        }

        const velocity = this.rigidBody.linearVelocity;
        return Math.abs(velocity.y) <= 5;
    }

    private focusGameCanvas(): void {
        const canvas = cc.game.canvas as HTMLCanvasElement;

        if (canvas) {
            canvas.setAttribute('tabindex', '0');
            canvas.focus();
        }
    }
}