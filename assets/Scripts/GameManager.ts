import { _decorator, AudioClip, AudioSource, Component, EventTouch, Input, math, Node, ParticleSystem2D, Sprite, SpriteAtlas, tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {


    @property([Node])
    totalNodes: Node[] = [];

    @property(Node)
    dragArea: Node = null;

    @property(Node)
    ParticleNode: Node = null;

    @property(SpriteAtlas)
    ColorImgs: SpriteAtlas = null;

    @property(AudioClip)
    audioclips: AudioClip[] = [];

    private draggingNode: Node | null = null;
    private originalPositions: Map<Node, Vec3> = new Map();
    private offset: Vec3 = new Vec3();

    audiosource: AudioSource;

    onLoad() {
        this.audiosource = this.node.getComponent(AudioSource);
        const allNodes = this.totalNodes

        // Store original positions
        for (let i = 0; i < 16; i++) {
            let node = allNodes[i]
            this.originalPositions.set(node, node.position.clone());

            // Attach touch handlers
            node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    onTouchStart(event: EventTouch) {
        this.draggingNode = event.target as Node;

        const touchPos = event.getUILocation();
        const worldZero = this.draggingNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);

        this.offset.set(touchPos.x - worldZero.x, touchPos.y - worldZero.y, 0);
        this.draggingNode.setSiblingIndex(this.draggingNode.parent.children.length - 1)
    }

    onTouchMove(event: EventTouch) {
        if (!this.draggingNode || !this.dragArea) return;

        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x - this.offset.x, touchPos.y - this.offset.y, 0);

        const localPos = this.dragArea.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        this.draggingNode.setPosition(localPos);
    }

    SnappedNodes: string[] = [];

    onTouchEnd(event: EventTouch) {
        if (!this.draggingNode) return;

        let snapped = false;

        for (let target of this.totalNodes) {
            const dist = Vec3.distance(this.draggingNode.position, target.position);
            if (dist < 50 && this.draggingNode != target && this.draggingNode.name === target.name) {
                this.draggingNode.setPosition(target.position);
                if (!target.children?.length && this.SnappedNodes.indexOf(target.name) == -1) {
                    this.ParticleNode.setPosition(target.position)
                    this.ParticleNode.getComponent(ParticleSystem2D).enabled = true;
                    this.ParticleNode.getComponent(ParticleSystem2D).resetSystem()
                    tween(target)
                        .to(0.2, { scale: new Vec3(0.7, 0.7, 0.7) }, { easing: "quadIn" })
                        .to(0.2, { scale: new Vec3(0.58, 0.58, 0.58) }, { easing: "quadIn" })
                        .call(() => {
                            this.ParticleNode.getComponent(ParticleSystem2D).enabled = false;
                        })
                        .start();

                   

                    target.getComponent(Sprite).spriteFrame = this.ColorImgs.getSpriteFrame(target.name);
                    this.SnappedNodes.push(target.name)
                    this.draggingNode.active = false;
                //    const index = this.draggableNodes.findIndex(n => n === this.draggingNode);
                //     if (index !== -1) {
                //          this.draggableNodes.splice(index, 1);
                //     }
                    this.audiosource.playOneShot(this.audioclips[0], 0.6);
                    snapped = true;

                } else if (target.children?.length && this.SnappedNodes.indexOf(target.name) !== -1) {
                    target.children[0].active = true;
                    this.draggingNode.active = false;
                    // this.draggableNodes = this.draggableNodes.filter(node => node !== this.draggingNode);
                    this.audiosource.playOneShot(this.audioclips[2], 0.6);
                    this.scheduleOnce(()=>{
                        let ranId = math.randomRangeInt(3,5);
                        this.audiosource.playOneShot(this.audioclips[ranId], 0.6);
                    },0.3)
                    snapped = true;
                }

                break;
            }
        }

        if (!snapped) {
            const original = this.originalPositions.get(this.draggingNode);
            if (original) {
                this.draggingNode.setPosition(original);
                this.audiosource.playOneShot(this.audioclips[1], 0.6);
            }
        }

        this.draggingNode = null;
    }

}

