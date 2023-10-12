import { MeshStandardMaterial } from "three";
import { EventTarget, Listener, mainScene } from "../scene";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { CustomModel } from "./custom_model";
import { SLIVER } from "../utils/material";
import { RackSize, SubRackSize } from "../store/size";
import { SubRack } from "./sub_rack";
import { RackPanel } from "../html/rack_panel";
import { SubRackPanel } from "../html/sub_rack_panel";

export class Rack extends CustomModel {
	constructor(row = 8, col = 3) {
		super();
		this.row = row;
		this.col = col;
		const subRackSize = new SubRackSize(row, col);
		this.initSize(subRackSize);
		this.setName(Rack.modelName);
		this.render();
	}

	private row: number;
	private col: number;

	width: number = 10;
	height: number = 16;
	depth: number = 30;
	eh = this.height / 20; // 边缘高度

	thickness = 0.1; // 板材厚度

	static readonly modelName = "rack";

	private totalLevel = 2;

	// 子冻存架
	private subRacks: SubRack[] = [];

	// 抽出的子冻存架
	private activeSubRack: SubRack | null = null;

	// 操作面板
	private operationPanel: RackPanel | null = null;

	// 子冻存架操作面板
	private subRackoperationPanel: SubRackPanel | null = null;

	// 根据子冻存架的尺寸初始化冻存架尺寸
	private initSize(subRackSize: SubRackSize) {
		const rackSize = new RackSize(subRackSize);
		this.width = rackSize.width;
		this.height = rackSize.height;
		this.depth = rackSize.depth;
		this.eh = rackSize.eh;
		this.thickness = rackSize.thickness;
	}

	private panel() {
		const panel = new CustomModel();

		const w = this.width;
		const h = this.eh;
		const d = this.depth;
		const p2 = Tools.rectMesh(new RectMeshOption(d, h));
		const p3 = Tools.rectMesh(new RectMeshOption(w, h));
		const p4 = Tools.rectMesh(new RectMeshOption(d, h));
		const p5 = Tools.rectMesh(new RectMeshOption(w, d));

		p2.translateX(w - this.thickness);
		p2.rotateY(deg2rad(90));
		p3.translateZ(-d);
		p4.rotateY(deg2rad(90));
		p5.translateY(h);
		p5.rotateX(-deg2rad(90));
		panel.add(p2, p3, p4, p5);

		return panel;
	}

	private mid(parent: CustomModel) {
		const panel = Tools.rectMesh(new RectMeshOption(this.width, this.depth));
		panel.translateY(this.height / 2);
		panel.rotateX(-deg2rad(90));
		const c1 = Tools.rectMesh(new RectMeshOption(this.depth, this.eh));
		const c2 = Tools.rectMesh(new RectMeshOption(this.depth, this.eh));

		const ty = this.height / 2 - this.eh / 2;
		c1.translateY(ty);
		c2.translateY(ty);

		c1.rotateY(deg2rad(90));
		c2.translateX(this.width - this.thickness);
		c2.rotateY(deg2rad(90));
		parent.add(panel, c1, c2);
	}

	private banding(parent: CustomModel) {
		const w = this.width / 5;
		const h = this.height + this.eh * 2;
		const p1 = Tools.rectMesh(new RectMeshOption(this.depth / 10, this.height));
		const p2 = Tools.rectMesh(new RectMeshOption(this.depth / 10, this.height));
		const p3 = Tools.rectMesh(new RectMeshOption(w, h));
		const p4 = Tools.rectMesh(new RectMeshOption(w, h));
		const p5 = Tools.rectMesh(new RectMeshOption(w, h));
		const p6 = Tools.rectMesh(new RectMeshOption(w, h));
		p1.rotateY(deg2rad(90));
		p2.translateX(this.width - this.thickness);
		p2.rotateY(deg2rad(90));

		p3.translateZ(-this.depth);
		p4.translateZ(-this.depth);
		p5.translateZ(-this.depth);
		p6.translateZ(-this.depth);
		p3.translateY(-this.eh);
		p4.translateY(-this.eh);
		p5.translateY(-this.eh);
		p6.translateY(-this.eh);
		p5.translateX(this.width - w);
		p6.translateX(this.width);

		p4.translateX(this.thickness);
		p4.rotateY(deg2rad(-90));
		p6.rotateY(deg2rad(-90));
		parent.add(p1, p2, p3, p4, p5, p6);
	}

	private addLogo(parent: CustomModel) {
		const size = this.width / 6.5;
		const height = this.thickness;
		const material = new MeshStandardMaterial({ color: SLIVER, metalness: 1, roughness: 0.48 });
		Tools.textMesh("Haier", { size, height }, material).then((mesh) => {
			mesh.translateX(this.width / 4);
			mesh.translateY(this.height + 1 - this.thickness);
			mesh.translateZ(-this.height / 10);
			mesh.rotateX(-deg2rad(90));
			parent.add(mesh);
			mainScene.render();
		});
	}

	private render() {
		const container = new CustomModel();

		const top = this.panel();
		const bottom = this.panel();
		top.translateY(this.height);
		bottom.rotateZ(deg2rad(180));
		bottom.translateX(-this.width);
		container.add(top, bottom);
		this.mid(container);
		this.banding(container);
		this.addLogo(container);
		this.add(container);

		container.translateZ(this.depth);
		container.translateY(this.eh + this.thickness);
	}

	// 指定层是否有子冻存架
	levelExists(level: number) {
		for (let i = 0; i < this.subRacks.length; i++) {
			const element = this.subRacks[i];
			if (element.level == level) return true;
		}
		return false;
	}

	get outerPosition() {
		return this.depth + 1;
	}

	get innerPosition() {
		return 0;
	}

	// 插入子冻存架
	insertSubRack = (subRack: SubRack) => {
		Tools.animate({ z: this.outerPosition }, { z: this.innerPosition }, ({ z }) => {
			subRack.position.setZ(z);
			mainScene.render();
		});
	};

	// 抽出子冻存架
	drawOutSubRack = (subRack: SubRack) => {
		Tools.animate({ z: this.innerPosition }, { z: this.outerPosition }, ({ z }) => {
			subRack.position.setZ(z);
			mainScene.render();
		});
	};

	// 添加子冻存架
	addSubRack(level = 1): boolean {
		if (this.levelExists(level)) return false;
		const sub = new SubRack(this.row, this.col);
		sub.level = level;
		const y = (level - 1) * (this.height / 2 + this.eh + this.thickness);
		sub.translateX(this.thickness);
		sub.translateY(y);
		sub.translateZ(this.outerPosition);
		mainScene.addEventListener(new Listener("click", sub.doorModel, this.onSubRackClick));
		this.subRacks.push(sub);
		this.insertSubRack(sub);
		this.add(sub);
		return true;
	}

	private onAddSubRack = () => {
		if (this.subRacks.length >= this.totalLevel) return;
		const w = this.width;
		const h = this.height;
		const d = this.depth;
		this.focusLeft45(w, h, d).then(() => {
			this.addSubRackAnywhere();
		});
	};

	// 显示冻存架操作面板
	showOperationPanel() {
		if (this.operationPanel) return;
		this.operationPanel = new RackPanel();
		this.operationPanel.onAddSubRack = this.onAddSubRack;
		this.operationPanel.render();
	}

	closeOperationPanel() {
		if (!this.operationPanel) return;
		this.operationPanel.destroy();
		this.operationPanel = null;
	}

	// 显示子冻存架操作面板
	showSubRackoperationPanel(sub: SubRack) {
		if (this.subRackoperationPanel) return;
		this.subRackoperationPanel = new SubRackPanel(sub);
		this.subRackoperationPanel.onInsert = () => {
			if (this.activeSubRack) this.closeSubRack();
		};
		this.subRackoperationPanel.onRemove = () => {
			if (this.activeSubRack) this.removeSubRack(this.activeSubRack);
		};
		this.subRackoperationPanel.render();
	}

	closeSubRackoperationPanel() {
		if (!this.subRackoperationPanel) return;
		this.subRackoperationPanel.destroy();
		this.subRackoperationPanel = null;
	}

	// 点击子冻存架
	private onSubRackClick = (target: EventTarget) => {
		const sub = CustomModel.findNamedParent(target.object, SubRack.modelName) as SubRack;
		const isActived = this.activeSubRack && this.activeSubRack.uuid === sub.uuid;
		this.focusAhead(this.width, this.height, this.depth, 4).then(() => {
			if (isActived) {
				this.closeSubRack();
			} else {
				this.selectSubRack(sub);
			}
		});
	};

	// 选中子冻存架
	selectSubRack = (subRack: SubRack) => {
		if (this.activeSubRack) this.closeSubRack();
		subRack.selected = true;
		this.activeSubRack = subRack;
		this.drawOutSubRack(subRack);
		this.showSubRackoperationPanel(subRack);
		this.closeOperationPanel();
	};

	// 关闭子冻存架
	closeSubRack = () => {
		if (!this.activeSubRack) return;
		this.activeSubRack.selected = false;
		this.activeSubRack.closePipe();
		this.insertSubRack(this.activeSubRack);
		this.activeSubRack = null;
		this.closeSubRackoperationPanel();
		this.showOperationPanel();
	};

	// 寻找空位
	findFreePosition(): number {
		for (let i = 1; i <= this.totalLevel; i++) {
			if (!this.levelExists(i)) return i;
		}
		return 0;
	}

	// 在任意空闲位置添加子冻存架
	addSubRackAnywhere(): boolean {
		if (this.subRacks.length >= this.totalLevel) return false;
		const level = this.findFreePosition();
		if (!level) return false;
		return this.addSubRack(level);
	}

	// 删除子冻存架
	removeSubRack = (sub: SubRack) => {
		mainScene.removeModelEvent(sub.doorModel);
		sub.getPipes().forEach((p) => {
			mainScene.removeModelEvent(p.lid);
		});
		this.remove(sub);
		this.activeSubRack = null;
		if (this.subRackoperationPanel) this.subRackoperationPanel.destroy();
		this.subRacks = this.subRacks.filter((s) => s.uuid != sub.uuid);
		mainScene.render();
		this.showOperationPanel();
	};
}
