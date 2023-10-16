import { MeshStandardMaterial } from "three";
import { EventTarget, Listener, Position3, mainScene } from "../scene";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { ModelContainer } from "./model_container";
import { SLIVER } from "../utils/material";
import { RackSize, SubRackSize } from "../store/size";
import { SubRack } from "./sub_rack";
import { globalPanel } from "../html/single_panel";
import { NestedContainer } from "./nested_container";

export class Rack extends NestedContainer {
	constructor(option?: { rows?: number; cols?: number; childRows?: number; childCols?: number }) {
		super("rack");
		const defaultOption = { rows: 2, cols: 1, childRows: 8, childCols: 3 };
		const ops = option ? { ...defaultOption, ...option } : defaultOption;
		this.rows = ops.rows;
		this.cols = ops.cols;
		const subRackSize = new SubRackSize(ops.childRows, ops.childCols);
		this.initSize(subRackSize);
		this.render();
	}

	rows: number;
	cols: number;

	width: number = 0;
	height: number = 0;
	depth: number = 0;
	eh = 0; // 边缘高度

	thickness = 0.1; // 板材厚度

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
		const panel = new ModelContainer();

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

	private mid(parent: ModelContainer) {
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

	private banding(parent: ModelContainer) {
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

	private addLogo(parent: ModelContainer) {
		const size = this.width / 6.5;
		const height = this.thickness;
		const material = new MeshStandardMaterial({ color: SLIVER, metalness: 1, roughness: 0.48 });
		Tools.textMesh("Haier", { size, height }, material).then((mesh) => {
			mesh.translateX(this.width / 4);
			mesh.translateY(this.height + size - height);
			mesh.translateZ(-this.height / 10);
			mesh.rotateX(-deg2rad(90));
			parent.add(mesh);
			mainScene.render();
		});
	}

	private render() {
		const container = new ModelContainer();
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

	get boxSize() {
		return { width: this.width, height: this.height, depth: this.depth };
	}

	getDefaultChildNodeTranslate(childNode: NestedContainer): Position3 {
		const { row } = childNode.innsertPosition;
		const x = this.thickness;
		const y = row * (this.height / 2 + this.eh + this.thickness);
		const z = 0;
		return { x, y, z };
	}

	childNodeFocusSwitchingAnimate(childNode: NestedContainer, focus: boolean): void {
		childNode.focus({ multiple: 4, multipleY: 2 });
		const s0 = { d: 0 };
		const s1 = { d: this.depth + 1 };
		const from = focus ? s0 : s1;
		const to = focus ? s1 : s0;
		Tools.animate(from, to, ({ d }) => {
			childNode.position.setZ(d);
		});
	}

	createChildNode(): NestedContainer | undefined {
		return new SubRack();
	}

	get eventRegion(): ModelContainer | null {
		return this;
	}

	// 显示冻存架操作面板
	showOperationPanel() {
		globalPanel.render({
			title: "冻存架",
			labelValuePairs: [
				{ label: "品牌", value: "海尔" },
				{ label: "层数", value: "2层" },
			],
			buttons: [
				{ label: "添加", onclick: () => this.addChildNodeAnyWhere() },
				{ label: "全览", onclick: () => mainScene.resetCamera() },
			],
		});
	}
}
