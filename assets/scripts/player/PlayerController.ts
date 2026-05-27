const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property
    moveSpeed: number = 260;

    @property
    airMoveSpeed: number = 160;

    @property
    jumpSpeed: number = 430;

    @property(cc.SpriteFrame)
    bigMarioFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    smallMarioFrame: cc.SpriteFrame = null;

    @property(cc.Node)
    audioManagerNode: cc.Node = null;

    private rigidBody: cc.RigidBody = null;
    private moveDir: number = 0;
    private isBig: boolean = false;
    private smallWidth: number = 64;
    private smallHeight: number = 64;
    private smallColliderWidth: number = 44;
    private smallColliderHeight: number = 58;
    private smallColliderOffsetY: number = -2;

    onLoad(): void {
        this.rigidBody = this.getComponent(cc.RigidBody);
        const sprite = this.getComponent(cc.Sprite);
        if (sprite && !this.smallMarioFrame) {
            this.smallMarioFrame = sprite.spriteFrame;
        }
        this.focusGameCanvas();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
    private focusGameCanvas(): void {
        const canvas = cc.game.canvas as HTMLCanvasElement;

        if (canvas) {
            canvas.setAttribute('tabindex', '0');
            canvas.focus();
        }
    }
    onDestroy(): void {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(): void {
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
    }

    public becomeBig(): void {
        if (this.isBig) {
            return;
        }

        this.isBig = true;

        const oldBottom = this.node.y - this.node.height / 2;

        const sprite = this.getComponent(cc.Sprite);
        if (sprite && this.bigMarioFrame) {
            sprite.spriteFrame = this.bigMarioFrame;
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

    private becomeSmall(): void {
        if (!this.isBig) {
            return;
        }

        this.isBig = false;

        const oldBottom = this.node.y - this.node.height / 2;

        const sprite = this.getComponent(cc.Sprite);
        if (sprite && this.smallMarioFrame) {
            sprite.spriteFrame = this.smallMarioFrame;
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

    private onKeyDown(event: cc.Event.EventKeyboard): void {
        if (event.keyCode === cc.macro.KEY.left || event.keyCode === cc.macro.KEY.a) {
            this.moveDir = -1;
        }

        if (event.keyCode === cc.macro.KEY.right || event.keyCode === cc.macro.KEY.d) {
            this.moveDir = 1;
        }

        if (event.keyCode === cc.macro.KEY.space) {
            this.jump();
        }
    }

    private onKeyUp(event: cc.Event.EventKeyboard): void {
        if (
            event.keyCode === cc.macro.KEY.left ||
            event.keyCode === cc.macro.KEY.a ||
            event.keyCode === cc.macro.KEY.right ||
            event.keyCode === cc.macro.KEY.d
        ) {
            this.moveDir = 0;
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
}