import { _decorator, Component, EventTouch, Input, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
 @property([Node])
    draggableNodes: Node[] = [];

    @property([Node])
    targetNodes: Node[] = [];

    @property(Node)
    dragArea: Node = null; // This should be the parent node of draggable/target items (like a UI layer)

    private draggingNode: Node | null = null;
    private originalPositions: Map<Node, Vec3> = new Map();
    private offset: Vec3 = new Vec3();

    onLoad() {
        const allNodes = [...this.draggableNodes, ...this.targetNodes];

        // Store original positions
        for (let node of allNodes) {
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
    }

    onTouchMove(event: EventTouch) {
        if (!this.draggingNode || !this.dragArea) return;

        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x - this.offset.x, touchPos.y - this.offset.y, 0);

        const localPos = this.dragArea.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        this.draggingNode.setPosition(localPos);
    }

    onTouchEnd(event: EventTouch) {
        if (!this.draggingNode) return;

        let snapped = false;

        for (let target of this.targetNodes) {
            const dist = Vec3.distance(this.draggingNode.position, target.position);
            if (dist < 50) {
                this.draggingNode.setPosition(target.position);
                snapped = true;
                break;
            }
        }

        if (!snapped) {
            const original = this.originalPositions.get(this.draggingNode);
            if (original) {
                this.draggingNode.setPosition(original);
            }
        }

        this.draggingNode = null;
    }

}

