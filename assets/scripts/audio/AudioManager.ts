const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {
    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    jumpSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    loseOneLifeSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    gameOverSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    levelClearSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    powerUpSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    powerDownSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    powerUpAppearSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    kickSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    stompSound: cc.AudioClip = null;

    @property
    bgmVolume: number = 0.5;

    @property
    effectVolume: number = 1.0;

    onLoad(): void {
        this.playBGM();
    }

    public playBGM(): void {
        if (this.bgm) {
            cc.audioEngine.playMusic(this.bgm, true);
            cc.audioEngine.setMusicVolume(this.bgmVolume);
        }
    }

    public stopBGM(): void {
        cc.audioEngine.stopMusic();
    }

    public playJump(): void {
        this.playEffect(this.jumpSound);
    }

    public playLoseOneLife(): void {
        this.playEffect(this.loseOneLifeSound);
    }

    public playGameOver(): void {
        this.stopBGM();
        this.playEffect(this.gameOverSound);
    }

    public playLevelClear(): void {
        this.stopBGM();
        this.playEffect(this.levelClearSound);
    }

    public playPowerUp(): void {
        this.playEffect(this.powerUpSound);
    }

    public playPowerDown(): void {
        this.playEffect(this.powerDownSound);
    }

    public playPowerUpAppear(): void {
        this.playEffect(this.powerUpAppearSound);
    }

    public playKick(): void {
        this.playEffect(this.kickSound);
    }

    public playStomp(): void {
        this.playEffect(this.stompSound);
    }

    private playEffect(clip: cc.AudioClip): void {
        if (clip) {
            cc.audioEngine.setEffectsVolume(this.effectVolume);
            cc.audioEngine.playEffect(clip, false);
        }
    }
}