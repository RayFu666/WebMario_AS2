import GameSession from "./GameSession";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Label)
    lifeLabel: cc.Label = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;

    @property(cc.Label)
    coinLabel: cc.Label = null;

    @property(cc.Node)
    audioManagerNode: cc.Node = null;

    @property
    fallLimitY: number = -450;

    @property
    startTime: number = 120;

    @property
    deathTransitionDelay: number = 1.8;

    private timeLeft: number = 120;
    private timerAcc: number = 0;
    private isChangingScene: boolean = false;

    start(): void {
        this.ensureGameSession();

        this.timeLeft = this.startTime;
        this.timerAcc = 0;
        this.isChangingScene = false;

        this.updateAllUI();
    }

    update(dt: number): void {
        if (this.isChangingScene) {
            return;
        }

        this.updateTimer(dt);
        this.checkPlayerFall();
    }

    private ensureGameSession(): void {
        if (GameSession.instance) {
            return;
        }

        const scene = cc.director.getScene();
        if (!scene) {
            return;
        }

        const sessionNode = new cc.Node('GameSession');
        scene.addChild(sessionNode);

        const session = sessionNode.addComponent(GameSession);
        session.resetForNewGame();
        session.selectedLevel = 'Level1';
    }

    public addScore(value: number): void {
        this.ensureGameSession();

        if (GameSession.instance) {
            GameSession.instance.addScore(value);
        }

        this.updateScoreUI();
    }

    public addCoin(value: number): void {
        this.ensureGameSession();

        if (GameSession.instance) {
            GameSession.instance.addCoin(value);
        }

        this.updateCoinUI();
    }

    public playerDie(): void {
        if (this.isChangingScene) {
            return;
        }

        this.ensureGameSession();

        this.isChangingScene = true;
        this.stopBGM();
        this.freezeLevelObjects();

        if (!GameSession.instance) {
            this.scheduleOnce(() => {
                this.goToGameOver();
            }, this.deathTransitionDelay);
            return;
        }

        this.playLoseOneLifeSound();

        if (GameSession.instance.life <= 1) {
            this.scheduleOnce(() => {
                GameSession.instance.loseLife();
                this.goToGameOver();
            }, this.deathTransitionDelay);

            return;
        }

        this.scheduleOnce(() => {
            GameSession.instance.loseLife();
            this.goToGameStart();
        }, this.deathTransitionDelay);
    }

    private freezeLevelObjects(): void {
        this.freezePlayer();
        this.freezeNodeByName('Enemy', 'EnemyController');
        this.freezeNodeByName('Mushroom', 'MushroomController');
        this.freezeNodeByName('QuestionBlock', 'QuestionBlockController');
    }

    private freezePlayer(): void {
        if (!this.player) {
            return;
        }

        const playerController = this.player.getComponent('PlayerController') as any;
        if (playerController && playerController.startDeathAnimation) {
            playerController.startDeathAnimation();
            return;
        }

        this.freezePhysicsBody(this.player);
    }

    private freezeNodeByName(nodeName: string, componentName: string): void {
        const scene = cc.director.getScene();
        if (!scene) {
            return;
        }

        this.freezeNodeRecursive(scene, nodeName, componentName);
    }

    private freezeNodeRecursive(node: cc.Node, nodeName: string, componentName: string): void {
        if (node.name === nodeName) {
            const component = node.getComponent(componentName) as any;
            if (component) {
                component.enabled = false;
            }

            this.freezePhysicsBody(node);
        }

        for (let i = 0; i < node.children.length; i++) {
            this.freezeNodeRecursive(node.children[i], nodeName, componentName);
        }
    }

    private freezePhysicsBody(node: cc.Node): void {
        const rigidBody = node.getComponent(cc.RigidBody);

        if (rigidBody) {
            rigidBody.linearVelocity = cc.v2(0, 0);
            rigidBody.angularVelocity = 0;
            rigidBody.type = cc.RigidBodyType.Static;
        }
    }

    private checkPlayerFall(): void {
        if (!this.player) {
            return;
        }

        if (this.player.y < this.fallLimitY) {
            this.playerDie();
        }
    }

    private updateTimer(dt: number): void {
        this.timerAcc += dt;

        while (this.timerAcc >= 1) {
            this.timerAcc -= 1;
            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.updateTimerUI();
                this.playerDie();
                return;
            }

            this.updateTimerUI();
        }
    }

    private goToGameStart(): void {
        if (GameSession.instance) {
            GameSession.instance.selectedLevel = 'Level1';
        }

        cc.director.loadScene('GameStart');
    }

    private goToGameOver(): void {
        cc.director.loadScene('GameOver');
    }

    private stopBGM(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.stopBGM) {
                audioManager.stopBGM();
            }
        }
    }

    private playLoseOneLifeSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.playLoseOneLife) {
                audioManager.playLoseOneLife();
            }
        }
    }

    public playPowerUpSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.playPowerUp) {
                audioManager.playPowerUp();
            }
        }
    }

    public playPowerDownSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.playPowerDown) {
                audioManager.playPowerDown();
            }
        }
    }

    public playPowerUpAppearSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.playPowerUpAppear) {
                audioManager.playPowerUpAppear();
            }
        }
    }

    public playKickSound(): void {
        if (this.audioManagerNode) {
            const audioManager = this.audioManagerNode.getComponent('AudioManager') as any;
            if (audioManager && audioManager.playKick) {
                audioManager.playKick();
            }
        }
    }

    private updateAllUI(): void {
        this.updateLifeUI();
        this.updateScoreUI();
        this.updateTimerUI();
        this.updateCoinUI();
    }

    private updateLifeUI(): void {
        if (this.lifeLabel) {
            const life = GameSession.instance ? GameSession.instance.life : 3;
            this.lifeLabel.string = '' + life;
        }
    }

    private updateScoreUI(): void {
        if (this.scoreLabel) {
            const score = GameSession.instance ? GameSession.instance.score : 0;
            this.scoreLabel.string = this.padScore(score);
        }
    }

    private updateTimerUI(): void {
        if (this.timerLabel) {
            this.timerLabel.string = '' + this.timeLeft;
        }
    }

    private updateCoinUI(): void {
        if (this.coinLabel) {
            const coin = GameSession.instance ? GameSession.instance.coin : 0;
            this.coinLabel.string = '' + coin;
        }
    }

    private padScore(value: number): string {
        let text = '' + value;

        while (text.length < 7) {
            text = '0' + text;
        }

        return text;
    }
}