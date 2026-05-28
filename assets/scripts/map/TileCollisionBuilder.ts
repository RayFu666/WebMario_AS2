import OneWayPlatform from "./OneWayPlatform";
const { ccclass, property } = cc._decorator;

@ccclass
export default class TileCollisionBuilder extends cc.Component {
    @property(cc.Node)
    tiledMapNode: cc.Node = null;

    @property(cc.Node)
    backgroundNode: cc.Node = null;

    @property(cc.Node)
    colliderRoot: cc.Node = null;

    @property
    objectGroupName: string = "Collisions";

    @property
    oneWayObjectGroupName: string = "OneWayPlatforms";

    @property
    debugVisible: boolean = true;

    @property
    offsetX: number = 0;

    @property
    offsetY: number = -320;

    onLoad(): void {
        this.buildColliders();
    }

    private buildColliders(): void {
        if (!this.tiledMapNode || !this.backgroundNode || !this.colliderRoot) {
            cc.warn("TileCollisionBuilder: missing node reference");
            return;
        }

        const tiledMap = this.tiledMapNode.getComponent(cc.TiledMap);

        if (!tiledMap) {
            cc.warn("TileCollisionBuilder: tiledMapNode has no cc.TiledMap");
            return;
        }

        const group = tiledMap.getObjectGroup(this.objectGroupName);

        if (!group) {
            cc.warn("TileCollisionBuilder: object group not found: " + this.objectGroupName);
            return;
        }

        this.colliderRoot.removeAllChildren();

        const mapSize = tiledMap.getMapSize();
        const tileSize = tiledMap.getTileSize();

        const originalMapWidth = mapSize.width * tileSize.width;
        const originalMapHeight = mapSize.height * tileSize.height;

        if (originalMapWidth <= 0 || originalMapHeight <= 0) {
            cc.warn("TileCollisionBuilder: invalid tiled map size");
            return;
        }

        const scaleX = this.backgroundNode.width / originalMapWidth;
        const scaleY = this.backgroundNode.height / originalMapHeight;

        const bgLeft = this.backgroundNode.x - this.backgroundNode.width * this.backgroundNode.anchorX;
        const bgBottom = this.backgroundNode.y - this.backgroundNode.height * this.backgroundNode.anchorY;

        const objects = group.getObjects();

        for (let i = 0; i < objects.length; i++) {
            const obj: any = objects[i];

            const x = Number(obj.x);
            const y = Number(obj.y);
            const width = Number(obj.width);
            const height = Number(obj.height);

            if (width <= 0 || height <= 0) {
                continue;
            }

            const colliderNode = new cc.Node("MapCollider_" + i);
            this.colliderRoot.addChild(colliderNode);

            const colliderWidth = width * scaleX;
            const colliderHeight = height * scaleY;

            colliderNode.width = colliderWidth;
            colliderNode.height = colliderHeight;

            colliderNode.x = bgLeft + (x + width / 2) * scaleX + this.offsetX;
            colliderNode.y = bgBottom + (y - height / 2) * scaleY + this.offsetY;

            const body = colliderNode.addComponent(cc.RigidBody);
            body.type = cc.RigidBodyType.Static;

            const collider = colliderNode.addComponent(cc.PhysicsBoxCollider);
            collider.size = cc.size(colliderWidth, colliderHeight);
            collider.offset = cc.v2(0, 0);
            collider.sensor = false;
            collider.apply();

            if (this.debugVisible) {
                const graphics = colliderNode.addComponent(cc.Graphics);
                graphics.fillColor = cc.color(255, 0, 0, 80);
                graphics.rect(-colliderWidth / 2, -colliderHeight / 2, colliderWidth, colliderHeight);
                graphics.fill();
            }
        }

        cc.log("TileCollisionBuilder created " + objects.length + " colliders");
        this.buildOneWayColliders(tiledMap, scaleX, scaleY, bgLeft, bgBottom);
    }

    private buildOneWayColliders(tiledMap: cc.TiledMap, scaleX: number, scaleY: number, bgLeft: number, bgBottom: number): void {
        const group = tiledMap.getObjectGroup(this.oneWayObjectGroupName);

        if (!group) {
            cc.warn("TileCollisionBuilder: object group not found: " + this.oneWayObjectGroupName);
            return;
        }

        const objects = group.getObjects();

        for (let i = 0; i < objects.length; i++) {
            const obj: any = objects[i];

            const x = Number(obj.x);
            const y = Number(obj.y);
            const width = Number(obj.width);
            const height = Number(obj.height);

            if (width <= 0 || height <= 0) {
                continue;
            }

            const colliderNode = new cc.Node("OneWayPlatform_" + i);
            this.colliderRoot.addChild(colliderNode);

            const colliderWidth = width * scaleX;
            const colliderHeight = height * scaleY;

            colliderNode.width = colliderWidth;
            colliderNode.height = colliderHeight;

            colliderNode.x = bgLeft + (x + width / 2) * scaleX + this.offsetX;
            colliderNode.y = bgBottom + (y - height / 2) * scaleY + this.offsetY;

            const body = colliderNode.addComponent(cc.RigidBody);
            body.type = cc.RigidBodyType.Static;

            const collider = colliderNode.addComponent(cc.PhysicsBoxCollider);
            collider.size = cc.size(colliderWidth, colliderHeight);
            collider.offset = cc.v2(0, 0);
            collider.sensor = true;
            collider.apply();

            colliderNode.addComponent(OneWayPlatform);

            if (this.debugVisible) {
                const graphics = colliderNode.addComponent(cc.Graphics);
                graphics.fillColor = cc.color(0, 255, 0, 80);
                graphics.rect(-colliderWidth / 2, -colliderHeight / 2, colliderWidth, colliderHeight);
                graphics.fill();
            }
        }

        cc.log("TileCollisionBuilder created " + objects.length + " one-way platforms");
    }
}