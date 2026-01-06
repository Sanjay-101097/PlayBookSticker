import { _decorator, Component, easing, Node, Size, tween, UITransform, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mask')
export class mask extends Component {
    start() {
        // tween(this.node.getComponent(UITransform)).to(1.2,{contentSize:},{easing:"smooth"}).start()
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        const startSize = uiTransform.contentSize.clone();
        const endSize = new Size(500, 500); // target size

        // temp object to tween width & height
        const sizeObj = { w: startSize.width, h: startSize.height };

        tween(sizeObj)
            .to(1, { w: endSize.width, h: endSize.height }, {
                easing:"quadInOut",
                onUpdate: (obj) => {
                    uiTransform.setContentSize(new Size(obj.w, obj.h));
                }
            })
            .start();
    }

    update(deltaTime: number) {
        
    }
}


