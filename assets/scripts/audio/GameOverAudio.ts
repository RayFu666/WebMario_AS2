const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverAudio extends cc.Component {
    @property(cc.AudioClip)
    gameOverSound: cc.AudioClip = null;

    @property
    delaySeconds: number = 1;

    private hasPlayed: boolean = false;

    start(): void {
        cc.audioEngine.stopMusic();
        cc.audioEngine.stopAllEffects();

        this.scheduleOnce(() => {
            if (this.hasPlayed) {
                return;
            }

            this.hasPlayed = true;

            if (this.gameOverSound) {
                cc.audioEngine.playEffect(this.gameOverSound, false);
            }
        }, this.delaySeconds);
    }
}