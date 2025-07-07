import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CTA')
export class CTA extends Component {

    start() {
        let icon = this.node.getChildByName("icon");
        let Titles = this.node.getChildByName("titles");
    }

    update(deltaTime: number) {
        
        
    }
}


