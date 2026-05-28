const { ccclass, property } = cc._decorator;

@ccclass
export default class StartAudioController extends cc.Component {
    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    @property
    bgmVolume: number = 0.5;

    onLoad(): void {
        this.playBGM();
    }

    public playBGM(): void {
        if (!this.bgm) {
            return;
        }

        if (cc.audioEngine.isMusicPlaying()) {
            return;
        }

        cc.audioEngine.playMusic(this.bgm, true);
        cc.audioEngine.setMusicVolume(this.bgmVolume);
    }

    public loadLevelSelect(): void {
        cc.director.loadScene('LevelSelect');
    }
}