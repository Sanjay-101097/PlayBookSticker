import { _decorator, AudioClip, AudioSource, Component, EventTouch, Input, math, Node, ParticleSystem2D, Sprite, SpriteAtlas, SpriteFrame, tween, UITransform, Vec3, v3, Tween, Animation } from 'cc';
import { StickerAnimation } from './StickerAnimation';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {


    @property([Node])
    totalNodes: Node[] = [];

    @property([Node])
    ShadowNodes: Node[] = [];

    @property([Node])
    coloringMasks: Node[] = [];

    @property([SpriteFrame])
    HandSP: SpriteFrame[] = [];

    @property([SpriteFrame])
    Cats: SpriteFrame[] = [];

    @property(Node)
    dragArea: Node = null;

    @property(Node)
    Hand: Node = null;
    @property(Node)
    star: Node = null;
    @property(Node)
    DragText: Node = null;

    @property(Node)
    ParticleNode: Node = null;

    @property(Node)
    CTA: Node = null;

    @property(AudioSource)
    BGAudio: AudioSource = null;


    @property(SpriteAtlas)
    ColorImgs: SpriteAtlas = null;

    @property(AudioClip)
    audioclips: AudioClip[] = [];

    private draggingNode: Node | null = null;
    private originalPositions: Map<Node, Vec3> = new Map();
    private offset: Vec3 = new Vec3();
    private shadowNode: Node | null = null;

    audiosource: AudioSource;
    count = 0
    arrdata = []

    onLoad() {
        this.audiosource = this.node.getComponent(AudioSource);
        const allNodes = this.totalNodes;
        this.scheduleOnce(() => {

            this.handTween(v3(this.totalNodes[0].position), this.totalNodes[12].position);
        }, 0.8)

        // Store original positions
        for (let i = 0; i < 13; i++) {
            let node = allNodes[i]
            let pos = node.position.clone()
            this.originalPositions.set(node, pos);

            this.arrdata.push(i);
            // Attach touch handlers
            node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);


        }


    }

    handTween(initPnt, finlaPnt) {


        this.DragText.active = true;

        let nodeToAnimate = this.DragText;
        const zoomIn = tween(nodeToAnimate)
            .to(0.8, { scale: v3(1.1, 1.1, 1.1) });
        const zoomOut = tween(nodeToAnimate)
            .to(0.8, { scale: v3(0.9, 0.9, 0.9) });
        tween(nodeToAnimate)
            .sequence(zoomIn, zoomOut)
            .union()
            .repeatForever()
            .start();
        this.Hand.setPosition(initPnt);
        this.Hand.active = true;
        this.Hand.setSiblingIndex(this.dragArea.children.length - 1)

        Tween.stopAllByTarget(this.Hand)

        tween(this.Hand)
            .repeatForever(
                tween()
                    .call(() => {
                        this.Hand.children[0].active = true;
                        this.Hand.children[1].active = false;
                    })
                    .to(1.5, { position: finlaPnt }, { easing: 'sineInOut' })
                    .call(() => {
                        this.Hand.children[0].active = false;
                        this.Hand.children[1].active = true;
                    })
                    .delay(0.6)
                    .call(() => {
                        if (finlaPnt.y < 350) {
                            this.Hand.children[0].active = true;
                            this.Hand.children[1].active = false;
                        }

                    })
                    .to(1, { position: initPnt }, { easing: 'sineInOut' })

                    .call(() => {
                        this.Hand.children[0].active = false;
                        this.Hand.children[1].active = true;
                    }).delay(0.6)

            )
            .start();
    }

    firsttime = true;


    onTouchStart(event: EventTouch) {
        this.star.active = false;
        this.DragText.active = false;
        this.isidle = false;
        if (this.firsttime) {
            this.BGAudio.play()
            this.firsttime = false;
        }
        this.draggingNode = event.target as Node;
        this.Hand.active = false;

        const touchPos = event.getUILocation();
        const worldZero = this.draggingNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);

        this.offset.set(touchPos.x - worldZero.x, touchPos.y - worldZero.y, 0);
        this.draggingNode.setSiblingIndex(this.draggingNode.parent.children.length - 1)
        tween(this.draggingNode).to(0.1, { scale: v3(0.65, 0.65, 0.5) }).start()
        this.draggingNode.children[0].active = false
        this.ShadowNodes.forEach((node, idx) => {
            if (node.name == this.draggingNode.name) {
                this.shadowNode = node;
                node.active = true;
                node.setPosition(this.originalPositions.get(this.draggingNode));
                this.coloringNode = this.coloringMasks[idx]
            }
        });
    }

    coloringNode;

    onTouchMove(event: EventTouch) {
        if (!this.draggingNode || !this.dragArea) return;

        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x - this.offset.x, touchPos.y - this.offset.y, 0);

        const localPos = this.dragArea.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        this.draggingNode.setPosition(localPos);
    }

    SnappedNodes: string[] = [];
    istutorial = true;
    nextanimNode;
    nextanimNode2;
    idx = 3;

    onTouchEnd(event: EventTouch) {
        if (!this.draggingNode) return;

        let snapped = false;
        if (this.idx < 12) {
            this.isidle = true;
            this.dt1 = 0;
        }


        for (let target of this.totalNodes) {
            const dist = Vec3.distance(this.draggingNode.position, target.position);
            if (dist < 50 && this.draggingNode != target && this.draggingNode.name === target.name) {
                this.draggingNode.setPosition(target.position);
                this.draggingNode.active = false;
                this.draggingNode.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
                this.draggingNode.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
                this.draggingNode.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
                this.shadowNode.active = false;
                target.getComponent(StickerAnimation).enabled = true
                let nextnode = this.totalNodes[this.idx]
                if(this.idx ==12){
                    nextnode = this.totalNodes[24]
                }
                this.coloringNode.active = true;
                if (this.idx <= 12) {
                    nextnode.active = true
                    nextnode.setPosition(this.originalPositions.get(this.draggingNode))
                    this.originalPositions.set(nextnode, this.originalPositions.get(this.draggingNode));
                    tween(nextnode)
                        .to(0.2, { scale: v3(0.8, 0.8, 0.8) }, { easing: "quadIn" })
                        .to(0.2, { scale: v3(0.6, 0.6, 0.6) }, { easing: "quadIn" })
                        // .delay(0.4)
                        .call(() => {
                            this.ParticleNode.getComponent(ParticleSystem2D).enabled = false;
                            this.star.active = true;
                            this.star.setPosition(target.position)
                            this.star.setSiblingIndex(this.dragArea.children.length - 1)
                            this.star.getComponent(Animation).play()
                            this.ParticleNode.setSiblingIndex(this.dragArea.children.length - 1)
                            this.ParticleNode.setPosition(target.position)
                            this.ParticleNode.getComponent(ParticleSystem2D).enabled = true;
                            this.ParticleNode.getComponent(ParticleSystem2D).resetSystem()

                        })
                        .start();
                }
                if (this.idx >= 12) {
                    this.CTA.active = true;
                }
                this.ctaEnabled = true;
                this.audiosource.playOneShot(this.audioclips[2], 0.6)
                this.idx += 1
                for (let i = 0; i < 12; i++) {
                    if (this.totalNodes[i].active) {
                        this.nextanimNode = i;
                        this.nextanimNode2 = i + 12;
                        break;
                    }
                }


                break;
            }

        }



        if (!snapped) {
            const original = this.originalPositions.get(this.draggingNode);
            if (original) {
                this.draggingNode.setPosition(original);
                this.draggingNode.setScale(0.6, 0.6, 0.6)
                this.draggingNode.children[0].active = true
                this.audiosource.playOneShot(this.audioclips[1], 0.6);
            }
        }

        this.draggingNode = null;

    }

    isidle = false;

    dt = 0;
    ctaEnabled = false;
    dt1 = 0;
    findhandpos() {
        this.handTween(this.totalNodes[this.nextanimNode].position, this.totalNodes[this.nextanimNode2].position)
    }

    update(deltaTime: number) {
        if (this.ctaEnabled) {
            this.dt += deltaTime;
            if (this.dt >= 60) {
                this.CTA.active = true;
                this.ctaEnabled = false;
            }
        }
        if (this.isidle) {
            this.dt1 += deltaTime;
            if (this.dt1 >= 4) {
                this.isidle = false;
                this.dt1 = 0;
                this.findhandpos()

            }
        }


    }

}

