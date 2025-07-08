import { _decorator, Component, Node, sys, tween, v3, Vec3 } from 'cc';
import { super_html_playable } from './super_html_playable';
const { ccclass, property } = _decorator;

@ccclass('CTA')
export class CTA extends Component {

    super_html_playable: super_html_playable = new super_html_playable();

    start() {

        let icon = this.node.getChildByName("icon");
        let Title = this.node.getChildByName("titles");
        let playbutton = this.node.getChildByName("PlayButton");

        tween(Title).delay(0.2).to(0.3, { scale: v3(1, 1, 1) }, { easing: "quadIn" }).start()
        tween(icon).delay(0.2).to(0.3, { scale: v3(1, 1.2, 1) }, { easing: "quadIn" }).to(0.3, { scale: v3(1.2, 1, 1) }, { easing: "quadIn" }).to(0.3, { scale: v3(1, 1, 1) }, { easing: "quadIn" }).start()
        tween(playbutton)
            .repeatForever(
                tween()
                    .to(0.6, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
                    .to(0.6, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'sineInOut' })
            )
            .start();

    }

    public Downnload(): void {
        this.super.download();
    }


    OnStartButtonClick() {

        // this.BG.enabled = false;
        // this.node.getComponent(AudioSource).enabled = false;

        if (sys.os === sys.OS.ANDROID) {
            window.open("https://play.google.com/store/apps/details?id=com.game.goolny.stickers&hl=en-US&gl=US", "MergeSticker");
        } else if (sys.os === sys.OS.IOS) {
            window.open("https://apps.apple.com/us/app/merge-sticker-playbook-2d/id6505066374", "MergeSticker");
        } else {
            window.open("https://play.google.com/store/apps/details?id=com.game.goolny.stickers&hl=en-US&gl=US", "MergeSticker");
        }
        this.super_html_playable.download();

    }

    update(deltaTime: number) {


    }
}