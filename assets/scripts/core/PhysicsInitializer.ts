const { ccclass } = cc._decorator;

@ccclass
export default class PhysicsInitializer extends cc.Component {
    onLoad(): void {
        const physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        physicsManager.gravity = cc.v2(0, -960);
    }
}