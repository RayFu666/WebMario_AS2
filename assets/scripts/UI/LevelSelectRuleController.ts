const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelectRuleController extends cc.Component {
    @property(cc.Node)
    rulePanel: cc.Node = null;

    @property(cc.Node)
    questionButton: cc.Node = null;

    private isOpen: boolean = false;

    start(): void {
        if (this.rulePanel) {
            this.rulePanel.active = false;
        }
    }

    public toggleRulePanel(): void {
        this.isOpen = !this.isOpen;

        if (this.rulePanel) {
            this.rulePanel.active = this.isOpen;
        }

        this.playButtonBounce();
    }

    private playButtonBounce(): void {
        if (!this.questionButton) {
            return;
        }

        this.questionButton.stopAllActions();
        this.questionButton.setScale(1, 1);

        cc.tween(this.questionButton)
            .to(0.08, { scale: 1.18 })
            .to(0.08, { scale: 1.0 })
            .start();
    }
}