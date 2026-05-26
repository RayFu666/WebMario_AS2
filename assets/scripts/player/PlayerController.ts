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

    private rigidBody: cc.RigidBody = null;
    private moveDir: number = 0;
    private isBig: boolean = false;

    onLoad(): void {
        this.rigidBody = this.getComponent(cc.RigidBody);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
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
    }

    private isOnGround(): boolean {
        if (!this.rigidBody) {
            return false;
        }

        const velocity = this.rigidBody.linearVelocity;
        return Math.abs(velocity.y) <= 5;
    }
}