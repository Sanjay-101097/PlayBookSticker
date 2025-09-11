import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mask')
export class mask extends Component {
    start() {
        tween(this.node).to(1.2,{scale:v3(1,1,1)},{easing:"smooth"}).start()
    }

    update(deltaTime: number) {
        
    }
}


