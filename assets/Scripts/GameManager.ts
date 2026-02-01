import { _decorator, AudioClip, AudioSource, Component, EventTouch, Input, math, Node, ParticleSystem2D, Sprite, SpriteAtlas, SpriteFrame, tween, UITransform, Vec3, v3, Tween, Animation, easing, UIOpacity, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {


    @property([Node])
    totalNodes: Node = null;

    @property([SpriteFrame])
    HandSP: SpriteFrame[] = [];

    @property([SpriteFrame])
    ImageNew: SpriteFrame[] = [];

    @property([SpriteFrame])
    ShadowNew: SpriteFrame[] = [];

    @property(Node)
    shadows: Node = null;

    @property(Node)
    Sticker: Node[] = [];

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

    @property(Node)
    filpanimations: Node[] = [];

    @property(Node)
    Pages: Node[] = [];

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
        // const allNodes = this.totalNodes;
        this.scheduleOnce(() => {
            const anim = this.filpanimations[0].getComponent(Animation);

            anim.play();

            anim.once(Animation.EventType.FINISHED, () => {
                this.filpanimations[0].active = false
                this.filpanimations[1].active = true
                const anim2 = this.filpanimations[1].getComponent(Animation);
                anim2.play("fast")
                this.audiosource.playOneShot(this.audioclips[0], 0.1);
                anim2.once(Animation.EventType.FINISHED, () => {
                    anim2.play("fast")
                    this.scheduleOnce(() => {
                        this.Pages[0].active = true;
                        this.Sticker[0].active = true
                    }, 0.02)
                    this.audiosource.playOneShot(this.audioclips[0], 0.1);
                    // anim2.once(Animation.EventType.FINISHED, () => {
                    //     anim2.play("fast")
                    anim2.once(Animation.EventType.FINISHED, () => {

                        let pos = this.Pages[0].position;
                        tween(this.Pages[0]).delay(0.1).to(0.3, { scale: v3(1.2, 1.2, 1.2), position: v3(0, pos.y - 250) }, { easing: "quadIn" }).start()
                        // })
                    })
                })
            });

            // this.handTween(v3(this.totalNodes[0].position), this.totalNodes[8].position);

        }, 0.8)

        // // Store original positions
        let dragnode = this.Pages[0].getChildByName("dragnodes")
        for (let i = 0; i < dragnode.children.length; i++) {
            let node = dragnode.children[i]
            let pos = node.position.clone()
            this.originalPositions.set(node, pos);

            this.arrdata.push(i);
            // Attach touch handlers
            node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);


        }

        this.scheduleOnce(()=>{
            this.findhandpos()
        },2)


    }

    animloop() {

        this.level =2
        this.Pages[1].addChild(this.Hand)
        this.Pages[0].active = false;
        this.dragArea = this.Pages[1]
        this.Sticker[0].active = false
        this.shadows = this.Pages[1].getChildByName("Shadow")
        this.totalNodes = this.Pages[1].getChildByName("dragnodes")
        const anim2 = this.filpanimations[1].getComponent(Animation);
        anim2.play("fast")
        this.audiosource.playOneShot(this.audioclips[0], 0.1);
        this.scheduleOnce(() => {

            this.Pages[1].active = true;
            this.Sticker[1].active = true
        }, 0.2)

        anim2.once(Animation.EventType.FINISHED, () => {
            // anim2.play("fast")
            // anim2.once(Animation.EventType.FINISHED, () => {

            let pos = this.Pages[1].position;
            tween(this.Pages[1]).delay(0.1).to(0.3, { scale: v3(1.2, 1.2, 1.2), position: v3(0, pos.y - 250) }, { easing: "quadIn" }).start()
            // })
        });

        let dragnode = this.Pages[1].getChildByName("dragnodes")
        for (let i = 0; i < dragnode.children.length; i++) {
            let node = dragnode.children[i]
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
        this.Hand.setSiblingIndex(27)

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
        // this.shadows.children[this.draggingNode.getSiblingIndex()].setSiblingIndex(this.shadows.children.length - 1)
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
    level = 1

    Crtcount = 0

    onTouchEnd(event: EventTouch) {
        if (!this.draggingNode) return;

        let snapped = false;
        this.isidle = true;
        this.dt1 = 0;
        this.audiosource.playOneShot(this.audioclips[1], 0.6);
        for (let target of this.totalNodes.children) {
            const dist = Vec3.distance(this.draggingNode.position, target.position);
            if (dist < 50 && this.draggingNode != target && this.draggingNode.name === target.name) {
                this.draggingNode.setPosition(target.position);
                this.draggingNode.active = false
                target.setScale(0, 0, 0)
                let islast = false
                target.getComponent(Sprite).spriteFrame = this.totalNodes.getChildByName((Number(target.name) + 1).toString()).getComponent(Sprite).spriteFrame
                if (target.name === "2" && this.level === 1) {
                    target.getComponent(UITransform).width += 120
                    islast = true;
                    target.getComponent(Sprite).spriteFrame = this.ImageNew[0]
                } else if (target.name === "3" && this.level === 2) {
                    target.getComponent(UITransform).width += 120
                    target.getComponent(UITransform).height += 120
                    islast = true;
                    target.getComponent(Sprite).spriteFrame = this.ImageNew[1]
                }
                let shadownode = this.shadows.children[target.getSiblingIndex()];
                // shadownode.getComponent(Sprite).spriteFrame = this.ShadowNew[this.Crtcount]
                let curidx = Number(target.name)
                if (target.name != "2" && this.level === 1) {
                    target.name = (curidx + 1).toString()
                } else if (target.name != "3" && this.level === 2) {
                    target.name = (curidx + 1).toString()
                }
                
                let ParticleNode = target.parent.parent.getChildByName("Particle2D");
                ParticleNode.setPosition(target.position)
                ParticleNode.active = true;
                ParticleNode.getComponent(ParticleSystem2D).playOnLoad = true;
                this.audiosource.playOneShot(this.audioclips[2], 0.6);
                target.setSiblingIndex(target.parent.children.length - 1)
                tween(target).to(0.15, { scale: v3(0.6, 0.6, 0.6) }, { easing: "quadIn" }).to(0.1, { scale: v3(0.35, 0.35, 0.35) }, { easing: "quadOut" }).delay(0.2).call(() => {
                    ParticleNode.active = false;
                    if (islast) {
                        let worldpos = target.worldPosition
                        target.removeFromParent()
                        target.scene.getChildByName("Canvas").addChild(target)
                        const localPos = target.scene.getChildByName("Canvas")
                            .getComponent(UITransform)
                            .convertToNodeSpaceAR(worldpos);

                        target.setPosition(localPos);
                        // target.setPosition(worldpos)
                        tween(target).to(0.2, { scale: v3(0.8, 0.8, 0.8), y: target.position.y + 50 }, { easing: "quadIn" }).delay(0.2).call(() => {
                            target.active = false
                            this.Sticker[this.level-1].children[1].active = true
                            this.audiosource.playOneShot(this.audioclips[0], 0.6);
                            this.scheduleOnce(()=>{
                                this.audiosource.playOneShot(this.audioclips[4], 0.6);
                            },0.2)
                            tween(this.node).delay(2).call(() => {
                                
                                if(this.level===2){
                                    this.CTA.active =true;
                                    
                                }
                                    
                                if(this.level===1){
                                    this.Crtcount =0;
                                    this.animloop();
                                }
                                
                                
                            }).start()
                        }).start()
                        tween(this.Pages[this.level-1]).delay(0.3).to(0.2, { y: this.Pages[this.level-1].y - 150 }, { easing: "quadIn" }).start()
                        tween(this.Pages[this.level-1].getComponent(UIOpacity)).delay(0.3).to(0.2, { opacity: 0 }).start()
                    }
                }).start()
                this.Crtcount += 1;
                snapped = true;
                break;
            }

        }



        if (!snapped) {
            const original = this.originalPositions.get(this.draggingNode);
            if (original) {
                let pos = this.draggingNode.position.clone()
                this.draggingNode.setPosition(original);
                let wrong = this.totalNodes.getChildByName("wrong")
                let wrong1 = this.totalNodes.getChildByName("wrong1")
                wrong.setSiblingIndex(this.totalNodes.children.length-1)
                wrong1.setSiblingIndex(this.totalNodes.children.length-1)
                wrong.setPosition(this.draggingNode.position)
                wrong1.setPosition(pos)
                tween(wrong).to(0.15,{scale:v3(0.3,0.3,0.3)}).to(0.15,{scale:v3(0.2,0.2,0.2)}).delay(0.3).call(()=>{
                    wrong.setScale(0,0,0)
                }).start()
                tween(wrong1).to(0.15,{scale:v3(0.3,0.3,0.3)}).to(0.15,{scale:v3(0.2,0.2,0.2)}).delay(0.3).call(()=>{
                    wrong1.setScale(0,0,0)
                }).start()
                this.audiosource.playOneShot(this.audioclips[3], 0.6);
            }
        }

        this.draggingNode = null;

    }

    isidle = false;

    dt = 0;
    ctaEnabled = false;
    dt1 = 0;
    findhandpos() {
        let initnode = this.totalNodes.getChildByName(this.Crtcount.toString())
        let finalnode;
        this.totalNodes.children.forEach(node => {
            if(initnode!=node&& initnode.name === node.name){
                finalnode = node
            }
        });
        this.handTween(initnode.position, finalnode.position)
    }

    update(deltaTime: number) {
        if (this.ctaEnabled) {
            this.dt += deltaTime;
            if (this.dt >= 40) {
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

