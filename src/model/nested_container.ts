import { Object3D, Vector3 } from "three";
import { ModelContainer } from "./model_container";
import { Position3, mainScene } from "../scene";
import { RENDER_DELAY } from "../store/constant";

export enum FocusPosition {
	left_45,
	right_45,
	ahead,
}

export enum FocusMode {
	focus,
	blur,
}

// 嵌套后的插入位置必须分解成二维的
export interface InsertPosition {
	row: number;
	col: number;
}

export interface FocusOptions {
	multiple?: number; // 乘以 multiple 倍
	cameraPosition?: FocusPosition;
	offsetX?: number;
	offsetY?: number;
	offsetZ?: number;
	multipleX?: number;
	multipleY?: number;
	multipleZ?: number;
	lookAtMultipleX?: number;
	lookAtMultipleY?: number;
	lookAtMultipleZ?: number;
	lookAtOffsetX?: number;
	lookAtOffsetY?: number;
	lookAtOffsetZ?: number;
}

// 嵌套的模型 container
export abstract class NestedContainer extends ModelContainer {
	constructor(name?: string) {
		super(name);
		this._isRoot = true;
	}

	readonly isNestedContainer = true;
	private _insertedPosition: InsertPosition = { row: 0, col: 0 }; // 插入父级模型节点时的位置，0 base
	private _parentNode: NestedContainer | null = null;
	private _isActive: boolean = false; // 是否处于被选中状态
	private _childNodes: NestedContainer[] = [];

	abstract readonly rows: number; // 当前节点的容量 - 最大行数
	abstract readonly cols: number; // 当前节点的容量 - 最大列数
	abstract readonly isClosedModel: boolean; // 非 focus 状态下隐藏子元素（性能优化）

	// 根据子节点的 insertedPosition 计算子节点的偏移（translate）
	abstract getDefaultChildNodeTranslate(childNode: NestedContainer): Position3;

	// 显示当前模型的操作面板 （当前节点被选中时调用此方法）
	abstract showOperationPanel(): void;

	// 获取点击事件触发位置
	abstract get eventRegion(): ModelContainer | null;

	// 定义当前节点的焦点切换动画
	abstract focusBlurAnimation(mode: FocusMode): void;

	// 定义当前节点的焦点相机切换动画
	abstract focusBlurCameraAnimation(mode: FocusMode): void;

	// 创建子元素
	abstract createChildNode(): NestedContainer | undefined;

	// 当前模型的盒模型大小
	abstract get boxSize(): { width: number; height: number; depth: number };

	get insertedPosition() {
		return this._insertedPosition;
	}

	get parentNode() {
		return this._parentNode;
	}

	get childNodes() {
		return this._childNodes;
	}

	get isActive() {
		return this._isActive;
	}

	private onFocusBlur(mode: FocusMode, resetCamera = true) {
		if (resetCamera) this.focusBlurCameraAnimation(mode);
		this.focusBlurAnimation(mode);
	}

	setActive(val: boolean, resetCamera = true) {
		const parentNode = this.parentNode;
		// 没有父节点说明当前节点是顶级节点
		if (!parentNode) {
			this.onFocusBlur(val ? FocusMode.focus : FocusMode.blur, resetCamera);
			this._isActive = val;
			return;
		}
		if (!val) {
			if (!this._isActive) return;
			this.onFocusBlur(FocusMode.blur, resetCamera);
			this._isActive = false;
			this.childNodes.forEach((c) => {
				c.setActive(false, false);
				if (c.parentNode!.isClosedModel) c.hidden();
			});
			parentNode.showOperationPanel();
			mainScene.render();
			return;
		}
		const nodes = parentNode.childNodes;
		nodes.forEach((n) => {
			n.setActive(false);
		});
		this.onFocusBlur(FocusMode.focus, resetCamera);
		this.childNodes.forEach((c) => c.show());
		this._isActive = true;
		this.showOperationPanel();
		mainScene.render();
	}

	// 将节点插入到当前节点的 childNodes 列表，返回是否插入成功
	private addToChildNodes(node: NestedContainer): boolean {
		for (let i = 0; i < this._childNodes.length; i++) {
			const element = this._childNodes[i];
			if (element.uuid === node.uuid) return false;
		}
		this._childNodes.push(node);
		return true;
	}

	// 从当前节点的 childNodes 中删除指定节点
	private deleteFromChildNodes(ids: string[]) {
		this._childNodes = this._childNodes.filter((c) => !ids.includes(c.uuid));
	}

	// 指定插入位置上是否存在子节点
	isFreePosition(position: InsertPosition) {
		for (let i = 0; i < this.childNodes.length; i++) {
			const element = this.childNodes[i];
			const p0 = element.insertedPosition;
			if (p0.row === position.row && p0.col === position.col) return false;
		}
		return true;
	}

	// 寻找空位置
	findFreePosition(): InsertPosition | undefined {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				const p = { row: r, col: c };
				if (this.isFreePosition(p)) return p;
			}
		}
		return undefined;
	}

	// 查找最近的 NestedContainer
	private findNestedContainer(obj: Object3D): NestedContainer | null {
		if ((obj as any).isNestedContainer) return obj as NestedContainer;
		if (!obj.parent) return null;
		return this.findNestedContainer(obj.parent);
	}

	// 点击事件处理器
	protected onClick(target: ModelContainer) {
		const parent = this.parentNode;
		if (!parent) return;
		// 父节点非选中状态时，将点击事件传导给父级节点
		if (!parent.isActive) {
			if (parent.eventRegion) parent.onClick(parent.eventRegion);
			return;
		}

		const node = this.findNestedContainer(target);
		if (!node) return;

		node.setActive(!node.isActive);
	}

	// 绑定点击事件
	private bindClick() {
		const region = this.eventRegion;
		if (!region) return;
		mainScene.addEventListener(region, (target: ModelContainer) => this.onClick(target));
	}

	// 设置为初始位置
	setDefaultPosition() {
		if (!this.parentNode) return;
		const offset = this.parentNode.getDefaultChildNodeTranslate(this);
		const { x, y, z } = offset;
		this.translateX(x);
		this.translateY(y);
		this.translateZ(z);
	}

	private _hiddenChildNodes = () => {
		this.childNodes.forEach((c) => c.hidden());
	};

	timer: any = null;

	private hiddenClosedModelChildNodes() {
		if (!this.isClosedModel || this.isActive) return;
		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(this._hiddenChildNodes, RENDER_DELAY);
	}

	// 将当前节点插入到指定节点，返回是否插入成功
	insertTo(parentNode: NestedContainer, position?: InsertPosition) {
		position = position ?? parentNode.findFreePosition();
		if (!position) return false;
		this._insertedPosition = position;
		const { row, col } = position;
		if (row < 0 || col < 0 || row >= parentNode.rows || col >= parentNode.cols) return false;
		if (!parentNode.addToChildNodes(this)) return false;
		this._parentNode = parentNode;
		this.setDefaultPosition();
		this.bindClick();
		this.show();
		parentNode.hiddenClosedModelChildNodes();
		return true;
	}

	// TODO 重新定义此方法
	addChildNodeAnyWhere() {}

	// 解除当前节点的事件绑定
	removeEvents() {
		mainScene.removeEventListener(this);
	}

	close() {
		this.setActive(false);
	}

	// 删除当前节点，并显示父级节点的操作面板
	destroyAndShowParentNode = () => {
		if (this.parentNode) {
			this.parentNode.showOperationPanel();
		}
		this.close();
		this.destroy();
		mainScene.render();
	};

	// 销毁当前节点	会自动解绑上下游节点，并删除当前节点元素及所有子元素的全部事件绑定
	destroy() {
		if (this.parentNode) {
			this.close();
			this.parentNode.deleteFromChildNodes([this.uuid]);
		}
		mainScene.removeEventListener(this);
		if (this.parent) this.parent.remove(this);
	}

	private _setVisible(value: boolean, obj: Object3D = this) {
		obj.visible = value;
		if (obj.children) {
			obj.children.forEach((c) => this._setVisible(value, c));
		}
	}

	hidden() {
		this._setVisible(false);
		this.parent?.remove(this);
	}

	show() {
		this._setVisible(true);
		const parent = this.parent || this.parentNode;
		parent?.add(this);
	}

	// 视角聚焦指定模型	(默认模型的 左下内 点为源点)
	focusTarget(boxSize: { width: number; height: number; depth: number }, position: Position3, options: FocusOptions = {}) {
		const p0 = position;
		const { width, height, depth } = boxSize;
		const w = width;
		const h = height;
		const d = depth;
		const {
			lookAtMultipleX: ltx = 1,
			lookAtMultipleY: lty = 1,
			lookAtMultipleZ: ltz = 1,
			lookAtOffsetX: lox = 0,
			lookAtOffsetY: loy = 0,
			lookAtOffsetZ: loz = 0,
		} = options;
		const lookAt = { x: p0.x + (w / 2) * ltx + lox, y: p0.y + (h / 2) * lty + loy, z: p0.z + (d / 2) * ltz + loz };
		const multiple = options.multiple ?? 3;
		const cameraPosition = options.cameraPosition ?? FocusPosition.ahead;
		const { offsetX: ox = 0, offsetY: oy = 0, offsetZ: oz = 0, multipleX: mx = 1, multipleY: my = 1, multipleZ: mz = 1 } = options;
		const dx = w * multiple * mx + ox;
		const dy = h * multiple * my + oy;
		const dz = d * multiple * mz + oz;
		let to: Position3 = { x: p0.x + w / 2, y: p0.y + dy, z: p0.z + dz };
		if (cameraPosition == FocusPosition.left_45) to = { x: p0.x - dx, y: p0.y + dy, z: p0.z + dz };
		if (cameraPosition == FocusPosition.right_45) to = { x: p0.x + dx, y: p0.y + dy, z: p0.z + dz };

		return mainScene.moveCameraTo(to, lookAt);
	}

	// 视角聚焦当前模型	(默认模型的 左下内 点为源点)
	focus(options: FocusOptions = {}) {
		const vec = new Vector3();
		const position = { ...this.getWorldPosition(vec) };
		this.focusTarget(this.boxSize, position, options);
	}
}
