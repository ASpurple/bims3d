import { CylinderGeometry, Mesh, Path, TorusGeometry } from "three";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { metalnessMaterial } from "../utils/material";
import { SubRackSize } from "../store/size";
import { PipeModel } from "./pipe";
import { globalPanel } from "../html/single_panel";
import { FocusMode, FocusPosition, NestedContainer } from "./nested_container";
import { ModelContainer } from "./model_container";
import { mainScene } from "../scene";

export interface PipePosition {
	row: number;
	col: number;
}

export class SubRack extends NestedContainer {
	constructor(rows = 8, cols = 3) {
		super("sub_rack");
		this.rows = rows;
		this.cols = cols;
		this.initSize();
		this.render();
	}

	rows = 0; // 冻存管行数
	cols = 0; // 冻存管列数
	readonly isClosedModel: boolean = false;

	rowSpace = 0; // 行间隔
	colSpace = 0; // 列间隔
	width: number = 0;
	height: number = 0;
	depth: number = 0;
	fh = 0; // 每层的侧边铁片高度
	holeRadius = 0;
	thickness = 0.1;

	doorModel: ModelContainer; // 门把手

	private initSize() {
		const size = new SubRackSize(this.rows, this.cols);
		this.rowSpace = size.rowSpace;
		this.colSpace = size.colSpace;
		this.width = size.width;
		this.depth = size.depth;
		this.height = size.height;
		this.fh = size.fh;
		this.holeRadius = size.holeRadius;
	}

	private floor() {
		const p = Tools.rectMesh(new RectMeshOption(this.width, this.depth));
		const c1 = Tools.rectMesh(new RectMeshOption(this.fh, this.depth));
		const c2 = Tools.rectMesh(new RectMeshOption(this.fh, this.depth));
		const c3 = Tools.rectMesh(new RectMeshOption(this.width, this.height));
		p.translateY(this.thickness);
		p.rotateX(deg2rad(90));
		c1.rotateY(deg2rad(90));
		c1.rotateZ(deg2rad(90));
		c2.translateX(this.width - this.thickness);
		c2.rotateY(deg2rad(90));
		c2.rotateZ(deg2rad(90));
		return [p, c1, c2, c3];
	}

	private verticalMesh() {
		const w = this.fh;
		const h = this.height;
		const mesh = Tools.shapeMesh((shape) => {
			shape
				.moveTo(0, 0)
				.lineTo(0, h - w)
				.lineTo(w, h)
				.lineTo(w, 0)
				.lineTo(0, 0);
		});
		return mesh;
	}

	private vertical() {
		const v1 = this.verticalMesh();
		const v2 = this.verticalMesh();
		const v3 = this.verticalMesh();
		const v4 = this.verticalMesh();
		v1.translateZ(this.fh);
		v1.rotateY(deg2rad(90));
		v2.translateX(this.width - this.thickness);
		v2.translateZ(this.fh);
		v2.rotateY(deg2rad(90));
		v3.translateX(this.thickness);
		v3.translateZ(this.depth - this.fh);
		v3.rotateY(deg2rad(-90));
		v4.translateZ(this.depth - this.fh);
		v4.translateX(this.width);
		v4.rotateY(deg2rad(-90));
		return [v1, v2, v3, v4];
	}

	private topPoleModel() {
		const w = this.depth;
		const h = this.fh;
		const mesh = Tools.shapeMesh((shape) => {
			shape
				.moveTo(h, 0)
				.lineTo(0, h)
				.lineTo(w, h)
				.lineTo(w - h, 0)
				.lineTo(h, 0);
		});
		return mesh;
	}

	private topPole() {
		const p1 = this.topPoleModel();
		const p2 = this.topPoleModel();
		p1.translateY(this.height - this.fh);
		p2.translateY(this.height - this.fh);
		p1.translateX(this.thickness);
		p1.rotateY(deg2rad(-90));
		p2.translateX(this.width);
		p2.rotateY(deg2rad(-90));
		return [p1, p2];
	}

	private midPole() {
		const w = this.depth;
		const h = this.fh;
		const p1 = Tools.rectMesh(new RectMeshOption(w, h));
		const p2 = Tools.rectMesh(new RectMeshOption(w, h));
		p1.translateY(this.height / 2 - this.fh);
		p2.translateY(this.height / 2 - this.fh);
		p1.translateX(this.thickness);
		p1.rotateY(deg2rad(-90));
		p2.translateX(this.width);
		p2.rotateY(deg2rad(-90));
		return [p1, p2];
	}

	private piercedPanel() {
		const w = this.depth;
		const h = this.width;
		const option = new RectMeshOption(w, h);

		const sr = this.rowSpace; // 行间隔
		const sc = this.colSpace; // 列间隔
		const radius = this.holeRadius;

		for (let i = 0; i < this.rows; i++) {
			// 行
			const x = sr + radius + i * (radius + sr + radius);
			for (let k = 0; k < this.cols; k++) {
				// 列
				const y = sc + radius + k * (radius + sc + radius);
				const path = new Path();
				path.ellipse(x, y, radius, radius, 0, 2 * Math.PI, false, 0);
				option.holes.push(path);
			}
		}

		const p1 = Tools.rectMesh(option);
		const p2 = Tools.rectMesh(option);
		p1.translateY(this.height - this.fh / 2);
		p2.translateY(this.height / 2 - this.fh / 2);
		p1.rotateY(deg2rad(-90));
		p2.rotateY(deg2rad(-90));
		p1.rotateX(deg2rad(-90));
		p2.rotateX(deg2rad(-90));

		return [p1, p2];
	}

	private doorPanel() {
		const w = this.width / 2;
		const h = this.height / 2;
		const t = this.thickness * 0.7;
		const r = t * 3; // 中间圆环半径
		const path = new Path().arc(t, h / 2, r - t, Math.PI / 2, -Math.PI / 2, true);
		const mesh = Tools.shapeMesh(
			(shape) => {
				shape
					.moveTo(0, 0)
					.lineTo(0, h)
					.lineTo(t, h)
					.lineTo(t, h / 2 + r)
					.moveTo(0, 0)
					.arc(t, h / 2, r, Math.PI / 2, -Math.PI / 2, true)
					.moveTo(t, h / 2 - r)
					.lineTo(t, 0)
					.lineTo(0, 0);
			},
			[path],
			{ depth: w }
		);
		mesh.translateX((this.width + w) / 2);
		mesh.translateY((this.height - h) / 1.5);
		mesh.translateZ(this.depth + t);
		mesh.rotateY(deg2rad(-90));
		const pw = w + r * 2;
		const ph = h * 0.6;
		const tab = new PullTab(pw, ph, t);
		tab.translateX((this.width - pw) / 2);
		tab.translateY(r + t + h * 0.4);
		tab.translateZ(this.depth + t * 2);
		return [mesh, tab];
	}

	private door() {
		const model = new ModelContainer();
		const p = Tools.rectMesh(new RectMeshOption(this.width, this.height));
		p.translateZ(this.depth);
		model.add(p, ...this.doorPanel());
		this.doorModel = model;
		return model;
	}

	private render() {
		const container = new ModelContainer();
		container.add(...this.floor());
		container.add(...this.vertical());
		container.add(...this.topPole());
		container.add(...this.midPole());
		container.add(...this.piercedPanel());
		container.add(this.door());
		this.add(container);
	}

	get boxSize() {
		return { width: this.width, height: this.height, depth: this.depth };
	}

	// 根据行和列计算冻存管偏移位置
	getDefaultChildNodeTranslate(childNode: NestedContainer) {
		const { row, col } = childNode.insertedPosition;
		const x = this.colSpace + this.holeRadius + col * (this.holeRadius * 2 + this.colSpace);
		const z = this.rowSpace + this.holeRadius + row * (this.holeRadius * 2 + this.rowSpace);
		return { x, y: this.thickness, z };
	}

	// 显示当前模型的操作面板
	showOperationPanel() {
		globalPanel.render({
			title: "冻存架 / 内部冻存架",
			labelValuePairs: [
				{ label: "行数", value: `${this.rows} 行` },
				{ label: "列数", value: `${this.cols} 列` },
			],
			buttonGroup: [
				{ label: "添加", onclick: () => this.addChildNodeAnyWhere() },
				{ label: "放回", onclick: () => this.close() },
				{
					label: "移除",
					onclick: () => this.destroyAndShowParentNode(),
					danger: true,
				},
			],
		});
	}

	focusBlurCameraAnimation(mode: FocusMode): void {
		const focus = mode === FocusMode.focus;
		if (focus) this.focus({ multipleY: 3, multipleZ: 1.5, cameraPosition: FocusPosition.left_45 });
	}

	focusBlurAnimation(mode: FocusMode) {
		const focus = mode === FocusMode.focus;
		const s0 = { d: 0 };
		const s1 = { d: this.depth + 1 };
		const from = focus ? s0 : s1;
		const to = focus ? s1 : s0;
		Tools.animate(from, to, ({ d }) => {
			this.position.setZ(d);
			mainScene.render();
		});
	}

	get eventRegion() {
		return this.doorModel;
	}

	createChildNode() {
		return new PipeModel();
	}
}

// 冻存架拉环
export class PullTab extends ModelContainer {
	constructor(width: number, height: number, radius: number) {
		super("pull-tab");
		this.width = width;
		this.height = height;
		this.radius = radius;
		this.render();
	}

	width = 0;
	height = 0;
	radius = 0;
	material = metalnessMaterial("#999999");

	innerCylinder() {
		const width = this.width;
		const r = this.radius;
		const geometry = new CylinderGeometry(r, r, width, 32);
		const material = this.material;
		const cylinder = new Mesh(geometry, material);
		cylinder.translateX(this.width / 2);
		cylinder.translateY(this.height);
		cylinder.rotateZ(deg2rad(90));
		return cylinder;
	}

	bufferCylinder() {
		const r = this.radius;
		const geometry = new TorusGeometry(this.height * 2, r, 16, 100, deg2rad(30));
		const material = this.material;
		const c1 = new Mesh(geometry, material);
		const c2 = new Mesh(geometry, material);
		const b1 = Tools.ballMesh(r, this.material);
		const b2 = Tools.ballMesh(r, this.material);
		const b3 = Tools.ballMesh(r, this.material);
		const b4 = Tools.ballMesh(r, this.material);
		const bt = this.innerCylinder();
		c1.translateX(this.width);
		c1.translateY(this.height);
		c1.translateZ(this.height * 2);
		c1.rotateY(deg2rad(90));
		c1.rotateZ(deg2rad(-30));
		c2.translateY(this.height);
		c2.translateZ(this.height * 2);
		c2.rotateY(deg2rad(90));
		c2.rotateZ(deg2rad(-30));
		b1.translateY(this.height);
		b2.translateX(this.width);
		b2.translateY(this.height);
		b3.translateZ(this.height / 4 + r);
		b4.translateX(this.width);
		b4.translateZ(this.height / 4 + r);
		bt.translateX(-this.height);
		bt.translateZ(this.height / 4 + r);
		return [c1, c2, b1, b2, b3, b4, bt];
	}

	outerCylinder() {
		const width = this.width - (this.width / 10) * 2;
		const r = this.radius * 2;
		const geometry = new CylinderGeometry(r, r, width, 32, 1, true);
		const material = this.material;
		const cylinder = new Mesh(geometry, material);
		cylinder.translateX(this.width / 2);
		cylinder.translateZ(this.height / 4 + r / 2);
		cylinder.rotateZ(deg2rad(90));
		return cylinder;
	}

	render() {
		const container = new ModelContainer();
		container.add(this.innerCylinder());
		container.add(...this.bufferCylinder());
		container.add(this.outerCylinder());
		this.add(container);
	}
}
