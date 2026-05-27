const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverAudio extends cc.Component {
    @property(cc.AudioClip)
    gameOverSound: cc.AudioClip = null;

    @property
    delaySeconds: number = 1;

    start(): void {
        cc.audioEngine.stopMusic();

        this.scheduleOnce(() => {
            if (this.gameOverSound) {
                cc.audioEngine.playEffect(this.gameOverSound, false);
            }
        }, this.delaySeconds);
    }
}