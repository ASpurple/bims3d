import { Object3D, Object3DEventMap } from "three";
import { ModelContainer } from "./model_container";
import { EventHandler, EventTarget, EventType, Listener, Position3, mainScene } from "../scene";
import { Tools } from "../utils/tools";

export enum FocusPosition {
	left_45,
	right_45,
	ahead,
}

// 嵌套后的插入位置必须分解成二维的
export interface InsertPosition {
	row: number;
	col: number;
}

export interface FocusOptions {
	multiple?: number;
	cameraPosition?: FocusPosition;
	offsetX?: number;
	offsetY?: number;
	offsetZ?: number;
	multipleX?: number;
	multipleY?: number;
	multipleZ?: number;
}

// 嵌套的模型 container
export abstract class NestedContainer extends ModelContainer {
	constructor(name?: string) {
		super(true, name);
	}

	readonly isNestedContainer = true;
	private _innsertPosition: InsertPosition = { row: 0, col: 0 }; // 插入父级模型节点时的位置，0 base
	private _parentNode: NestedContainer | null = null;
	private _activeChildNode: NestedContainer | null = null; // 被选中的子节点
	private childNodes: NestedContainer[] = [];

	get innsertPosition() {
		return this._innsertPosition;
	}

	get parentNode() {
		return this._parentNode;
	}

	get activeChildNode() {
		return this._activeChildNode;
	}

	// 当前节点是否处于选中状态
	get selected(): boolean {
		if (!this._parentNode || !this._parentNode.isModelContainer) return true;
		if (!this._parentNode._activeChildNode) return false;
		return this._parentNode._activeChildNode.uuid === this.uuid;
	}

	abstract readonly rows: number; // 当前节点的容量 - 最大行数
	abstract readonly cols: number; // 当前节点的容量 - 最大列数

	// 根据子节点的 innsertPosition 计算子节点的偏移（translate）
	abstract getDefaultChildNodeTranslate(childNode: NestedContainer): Position3;

	// 显示当前模型的操作面板 （当前节点被选中时调用此方法）
	abstract showOperationPanel(): void;

	// 获取点击事件触发位置
	abstract get eventRegion(): ModelContainer | null;

	// 创建一个新的子节点
	abstract createChildNode(): NestedContainer | undefined;

	// 定义子节点的焦点切换动画
	abstract childNodeFocusSwitchingAnimate(childNode: NestedContainer, focus: boolean): void;

	// 当前模型的盒模型大小
	abstract get boxSize(): { width: number; height: number; depth: number };

	// 选中子节点
	selectChildNode = (node: NestedContainer) => {
		if (node.selected) return;
		this._activeChildNode = node;
	};

	// 关闭子节点 (会递归关闭所有 focus 的子节点)
	closeChildNode = () => {
		if (!this._activeChildNode) return;
		const node = this._activeChildNode;
		this._activeChildNode = null;
		node.closeChildNode();
	};

	// 选中当前节点
	select() {
		if (!this.parentNode) return;
		this.parentNode.selectChildNode(this);
		this.parentNode.childNodeFocusSwitchingAnimate(this, true);
		this.showOperationPanel();
	}

	// 关闭当前节点
	close() {
		if (!this.parentNode || !this.selected) return;
		this.parentNode.closeChildNode();
		this.parentNode.showOperationPanel();
		this.parentNode.childNodeFocusSwitchingAnimate(this, false);
	}

	// 子节点的点击事件处理器
	private onChildNodeClick = (target: EventTarget) => {
		// 父节点非选中状态时忽略事件
		if (!this.selected) return;
		const node = this.findRoot(target.object) as NestedContainer;
		if (!node || !node.isNestedContainer) return;
		if (this.activeChildNode && !node.selected) this.activeChildNode.close();
		if (node.selected) {
			node.close();
		} else {
			node.select();
		}
	};

	// 子节点绑定点击事件
	bindClickForChildNode(childNode: NestedContainer) {
		const region = childNode.eventRegion;
		if (!region) return;
		mainScene.addEventListener(region, this.onChildNodeClick);
	}

	// 解除当前节点的事件绑定
	removeEvents() {
		mainScene.removeEventListener(this);
	}

	// 指定插入位置上是否存在子节点
	isChildNodeExists(position: InsertPosition) {
		for (let i = 0; i < this.childNodes.length; i++) {
			const element = this.childNodes[i];
			const p0 = element._innsertPosition;
			if (p0.row === position.row && p0.col === position.col) return true;
		}
		return false;
	}

	// 获取所有子节点
	getChildNodes() {
		return this.childNodes;
	}

	setInsertPosition(insertPosition: InsertPosition) {
		this._innsertPosition = insertPosition;
	}

	// 添加子节点
	addChildNode(node: NestedContainer, insertPosition?: InsertPosition): boolean {
		if (insertPosition) node.setInsertPosition(insertPosition);
		const { row, col } = node._innsertPosition;
		if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) return false;
		if (this.isChildNodeExists(node._innsertPosition)) return false;
		const offset = this.getDefaultChildNodeTranslate(node);
		const { x, y, z } = offset;
		node.translateX(x);
		node.translateY(y);
		node.translateZ(z);
		this.bindClickForChildNode(node);
		node._parentNode = this;
		this.add(node);
		this.childNodes.push(node);
		return true;
	}

	// 寻找空位置
	findFreePosition(): InsertPosition | null {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				const p = { row: r, col: c };
				if (!this.isChildNodeExists(p)) return p;
			}
		}
		return null;
	}

	// 在任意空位插入子节点
	addChildNodeAnyWhere(node?: NestedContainer): boolean {
		if (this.childNodes.length >= this.rows * this.cols) return false;
		const free = this.findFreePosition();
		if (!free) return false;
		node = node ?? this.createChildNode();
		if (!node) return false;
		const ok = this.addChildNode(node, free);
		mainScene.render();
		return ok;
	}

	// 删除当前节点，并显示父级节点的操作面板
	destroyAndShowParentNode = () => {
		if (this.parentNode) {
			this.parentNode.showOperationPanel();
		}
		this.destroy();
		mainScene.render();
	};

	// 销毁当前节点	会自动解绑上下游节点，并删除当前节点元素及所有子元素的全部事件绑定
	destroy() {
		if (this.parentNode) {
			this.parentNode.closeChildNode();
			this.parentNode.childNodes = this.parentNode.childNodes.filter((item) => item.uuid !== this.uuid);
		}
		if (!this.parent) return;
		mainScene.removeEventListener(this);
		this.parent.remove(this);
	}

	// 视角聚焦指定模型	(默认模型的 左下内 点为源点)
	focusTarget(boxSize: { width: number; height: number; depth: number }, position: Position3, options: FocusOptions = {}) {
		const p0 = position;
		const { width, height, depth } = boxSize;
		const w = width;
		const h = height;
		const d = depth;
		const lookAt = { x: p0.x + w / 2, y: p0.y + h / 2, z: p0.z + d / 2 };
		const multiple = options.multiple ?? 3;
		const cameraPosition = options.cameraPosition ?? FocusPosition.ahead;
		const { offsetX: ox = 0, offsetY: oy = 0, offsetZ: oz = 0, multipleX: mx = 1, multipleY: my = 1, multipleZ: mz = 1 } = options;

		let to: Position3 = { x: p0.x + w / 2, y: p0.y + h * multiple, z: p0.z + d * multiple };
		if (cameraPosition == FocusPosition.left_45) to = { x: p0.x - w * multiple, y: p0.y + h * multiple, z: p0.z + d * multiple };
		if (cameraPosition == FocusPosition.right_45) to = { x: p0.x + w * multiple, y: p0.y + h * multiple, z: p0.z + d * multiple };

		to.x *= mx;
		to.y *= my;
		to.z *= mz;
		to.x += ox;
		to.y += oy;
		to.z += oz;

		return mainScene.moveCameraTo(to, lookAt);
	}

	// 视角聚焦当前模型	(默认模型的 左下内 点为源点)
	focus(options: FocusOptions = {}) {
		const position = { ...this.position };
		this.focusTarget(this.boxSize, position, options);
	}
}
