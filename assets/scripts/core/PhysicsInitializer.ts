const { ccclass, property } = cc._decorator;

@ccclass
export default class PhysicsInitializer extends cc.Component {
    @property
    gravityY: number = -1728;

    onLoad(): void {
        const physicsManager = cc.director.getPhysicsManager();

        physicsManager.enabled = true;
        physicsManager.gravity = cc.v2(0, this.gravityY);
    }
}