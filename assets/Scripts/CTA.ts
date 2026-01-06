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

        let storeUrl = "";
        if (sys.os === sys.OS.ANDROID) {
            storeUrl =
                "https://play.google.com/store/apps/details?id=com.game5mobile.sticker&hl=en_IN";
        } else if (sys.os === sys.OS.IOS) {
            storeUrl =
                "https://apps.apple.com/us/app/sticker-book-color-by-number/id6450409974";
        } else {
            storeUrl =
                "https://play.google.com/store/apps/details?id=com.game5mobile.sticker&hl=en_IN";
        }
        this.super_html_playable.set_google_play_url(storeUrl)
        this.super_html_playable.download();
        
    }

    update(deltaTime: number) {


    }
}