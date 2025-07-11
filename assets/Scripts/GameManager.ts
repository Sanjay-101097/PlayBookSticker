import { _decorator, AudioClip, AudioSource, Component, EventTouch, Input, math, Node, ParticleSystem2D, Sprite, SpriteAtlas, SpriteFrame, tween, UITransform, Vec3, v3, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {


    @property([Node])
    totalNodes: Node[] = [];

    @property([SpriteFrame])
    HandSP: SpriteFrame[] = [];

    @property([SpriteFrame])
    Cats: SpriteFrame[] = [];

    @property(Node)
    dragArea: Node = null;

    @property(Node)
    Hand: Node = null;

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

    audiosource: AudioSource;
    count = 0
    arrdata = []

    onLoad() {
        this.audiosource = this.node.getComponent(AudioSource);
        const allNodes = this.totalNodes;
        this.scheduleOnce(() => {

            this.handTween(v3(this.totalNodes[0].position), this.totalNodes[8].position);
        }, 0.8)

        // Store original positions
        for (let i = 0; i < 16; i++) {
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
        this.Hand.setSiblingIndex(26)

        Tween.stopAllByTarget(this.Hand)

        tween(this.Hand)
            .repeatForever(
                tween()
                    .call(() => {
                        this.Hand.children[0].active = true;
                        this.Hand.children[1].active = false;
                    })
                    .to(1, { position: finlaPnt }, { easing: 'sineInOut' })
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
    }

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
    idx = 0;

    onTouchEnd(event: EventTouch) {
        if (!this.draggingNode) return;

        let snapped = false;
        this.isidle = true;
        this.dt1 = 0;

        for (let target of this.totalNodes) {
            const dist = Vec3.distance(this.draggingNode.position, target.position);
            if (dist < 50 && this.draggingNode != target && this.draggingNode.name === target.name) {
                this.draggingNode.setPosition(target.position);
                if (!target.children?.length && this.SnappedNodes.indexOf(target.name) == -1) {
                    this.ParticleNode.setPosition(target.position)
                    this.ParticleNode.getComponent(ParticleSystem2D).enabled = true;
                    this.ParticleNode.getComponent(ParticleSystem2D).resetSystem()
                    let scale1 = v3(0.7, 0.7, 0.7)
                    let scale2 = v3(0.58, 0.58, 0.58)
                    if (target.name == "Cat With Tube") {
                        scale1 = v3(1, 1, 1)
                        scale2 = v3(0.8, 0.8, 0.8)
                    }

                    tween(target)
                        .to(0.2, { scale: scale1 }, { easing: "quadIn" })
                        .to(0.2, { scale: scale2 }, { easing: "quadIn" }).delay(0.4)
                        .call(() => {
                            this.ParticleNode.getComponent(ParticleSystem2D).enabled = false;

                        })
                        .start();



                    target.getComponent(Sprite).spriteFrame = this.ColorImgs.getSpriteFrame(target.name);
                    if (target.name == "Cat with berry") {
                        target.getComponent(Sprite).spriteFrame = this.Cats[0]
                    } else if (target.name == "Cat with Bread") {
                        target.getComponent(Sprite).spriteFrame = this.Cats[1]
                    } else if (target.name == "Cat with fries") {
                        target.getComponent(Sprite).spriteFrame = this.Cats[2]
                    }

                    this.SnappedNodes.push(target.name)
                    this.draggingNode.active = false;
                    let num = this.totalNodes.indexOf(this.draggingNode)
                    if (this.idx < 3) {
                        this.originalPositions.set(this.totalNodes[5 + this.idx], this.originalPositions.get(this.draggingNode));
                        this.totalNodes[5 + this.idx].setPosition(this.originalPositions.get(this.draggingNode))

                    }

                    this.arrdata.splice(num, 1);
                    if (num < 8) {
                        this.nextanimNode = num + 8;
                        this.nextanimNode2 = num + 16;
                    } else {
                        this.nextanimNode = num;
                        this.nextanimNode2 = num + 8;
                    }

                    //    const index = this.draggableNodes.findIndex(n => n === this.draggingNode);
                    //     if (index !== -1) {
                    //          this.draggableNodes.splice(index, 1);
                    //     }
                    this.audiosource.playOneShot(this.audioclips[0], 0.6);
                    snapped = true;
                    if (this.istutorial) {
                        this.dt1 = 5
                        this.istutorial = false;
                    }


                } else if (target.children?.length && this.SnappedNodes.indexOf(target.name) !== -1) {
                    target.children[0].active = true;
                    this.draggingNode.active = false;
                    this.count += 1
                    // this.draggableNodes = this.draggableNodes.filter(node => node !== this.draggingNode);
                    this.audiosource.playOneShot(this.audioclips[2], 0.6);
                    if (this.idx < 3) {
                        this.originalPositions.set(this.totalNodes[13 + this.idx], this.originalPositions.get(this.draggingNode));
                        this.totalNodes[13 + this.idx].setPosition(this.originalPositions.get(this.draggingNode))

                        this.idx += 1
                    }

                    this.scheduleOnce(() => {
                        let ranId = math.randomRangeInt(3, 5);
                        this.audiosource.playOneShot(this.audioclips[ranId], 0.6);
                    }, 0.3)
                    snapped = true;

                    if (this.count >= 4) {
                        this.scheduleOnce(() => {
                            this.CTA.active = true;
                            // this.audiosource.playOneShot(this.audioclips[5], 0.6);
                        }, 1.3)

                    } else if (this.count >= 1) {
                        this.ctaEnabled = true
                    }
                    let num = this.totalNodes.indexOf(this.draggingNode)
                    this.arrdata.splice(num, 1);
                    if (num < 8) {
                        if (num >= 7 && this.arrdata.length > 1) {
                            this.nextanimNode = this.arrdata[0];
                            this.nextanimNode2 = this.nextanimNode + 8;
                        } else {
                            this.nextanimNode = num + 1;
                            this.nextanimNode2 = this.nextanimNode + 8;
                        }
                    } else {
                        if (num >= this.arrdata[this.arrdata.length - 1] && this.arrdata.length > 1) {
                            this.nextanimNode = this.arrdata[0];
                            this.nextanimNode2 = this.nextanimNode + 8;
                        } else {
                            this.nextanimNode = num - 7;
                            this.nextanimNode2 = this.nextanimNode + 8;
                        }

                    }
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
            if (this.dt >= 30) {
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

