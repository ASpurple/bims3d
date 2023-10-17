import { DoubleSide, ExtrudeGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, Path, Shape, Vector2, Vector3 } from "three";
import { ModelContainer } from "./model_container";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { NestedContainer } from "./nested_container";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { Position3, mainScene } from "../scene";
import { globalPanel } from "../html/single_panel";
import { Rack } from "./rack";
import { FreezerSize, RackSize, SubRackSize } from "../store/size";
import { metalnessMaterial } from "../utils/material";

export interface FreezerOption {
	rows?: number;
	cols?: number;
	rackSize?: RackSize;
	tag?: string | number;
}

export class Freezer extends NestedContainer {
	constructor(option: FreezerOption = {}) {
		super("freezer");
		this.tag = option.tag;
		this.rows = option.rows ?? 3;
		this.cols = option.cols ?? 4;
		this.size = new FreezerSize(this.rows, this.cols, new RackSize(new SubRackSize(8, 3)));
		this.render();
	}

	readonly rows: number;
	readonly cols: number;

	size: FreezerSize;

	door: ModelContainer;

	private _opening = false;

	tag?: string | number;

	// 冰箱蓝色底座
	createPedestal() {
		const material = new MeshPhysicalMaterial({ color: "#00305f", metalness: 0.7, roughness: 0.5 });
		const t = this.size.thinkness;
		const bt = t / 2; // 圆角，bevelThickness
		const w = this.size.width - bt;
		const h = this.size.pedestalHeight - bt;
		const d = this.size.depth - bt;
		const option = new RectMeshOption(w, h, d);
		option.setExtrudeOption({ bevelEnabled: true, bevelThickness: bt, bevelSegments: 10 });
		option.material = material;
		const mesh = Tools.rectMesh(option);
		mesh.translateX(bt / 2);
		mesh.translateY(bt / 2);
		mesh.translateZ(bt);

		const airPanelWidth = w * 0.64; // 底座通风板宽度
		const airPanelHeight = h * 0.8; // 底座通风板高度
		const leftSpacing = w * 0.12; // 底座通风板左边距
		const bottomSpacing = h * 0.12; //底座通风板上边距

		const airPanelHoles: Path[] = []; // 通风条列表
		const holesCount = 12; // 通风条个数
		const holeSpacing = airPanelWidth * 0.02;
		const holeWidth = airPanelWidth - 2 * holeSpacing;
		const holeHeight = (airPanelHeight - (holesCount + 1) * holeSpacing) / holesCount;
		for (let i = 0; i < holesCount; i++) {
			const p = new Path();
			const x = holeSpacing;
			const y = holeSpacing + i * (holeHeight + holeSpacing);
			Tools.drawRect(p, { x, y }, holeWidth, holeHeight);
			airPanelHoles.push(p);
		}

		// 底座上的通风板
		const airPanel = Tools.shapeMesh(
			(shape) => {
				Tools.drawRect(shape, { x: 0, y: 0 }, airPanelWidth, airPanelHeight);
			},
			airPanelHoles,
			{ depth: t },
			material
		);

		const airBackPanelOption = new RectMeshOption(airPanelWidth, airPanelHeight, t / 5);
		airBackPanelOption.material = new MeshBasicMaterial({ color: "#000000" });
		const airBackPanel = Tools.rectMesh(airBackPanelOption); // 通风板的黑色背景板

		airPanel.translateX(leftSpacing);
		airPanel.translateY(bottomSpacing);
		airPanel.translateZ(d + t / 2);
		airBackPanel.translateX(leftSpacing);
		airBackPanel.translateY(bottomSpacing);
		airBackPanel.translateZ(d + t / 2 + t / 3);

		const container = new ModelContainer(true, "freezer_pedestal");
		container.add(mesh, airPanel, airBackPanel);
		return container;
	}

	// 冰箱箱体
	createContainer() {
		const w = this.size.width;
		const h = this.size.height - this.size.pedestalHeight;
		const d = this.size.depth - this.size.dooThinkness;
		const t = this.size.thinkness;
		const holeWidth = w - t * 2;
		const holeHeight = h - t * 2;
		const hole = Tools.drawRect(new Path(), { x: t, y: t }, holeWidth, holeHeight);
		const mesh = Tools.shapeMesh(
			(shape) => {
				Tools.drawRect(shape, { x: 0, y: 0 }, w, h);
			},
			[hole],
			{ depth: d - t }
		);
		const backPanel = Tools.rectMesh(new RectMeshOption(w, h, t));
		const container = new ModelContainer(true, "freezer_door");
		mesh.translateY(this.size.pedestalHeight);
		mesh.translateZ(t);
		backPanel.translateY(this.size.pedestalHeight);
		container.add(mesh, backPanel);
		return container;
	}

	// 冰箱横向隔板
	createRowClapboards() {
		const container = new ModelContainer(true, "freezer_row_clapboards");
		const t = this.size.thinkness;
		const w = this.size.width - 2 * t;
		const h = t;
		const d = this.size.depth - this.size.dooThinkness - t - this.size.depthIndent;
		const ph = this.size.pedestalHeight;
		const storey = this.size.rowStoreyHeight; // 层高
		for (let r = 1; r < this.rows; r++) {
			const option = new RectMeshOption(w, d, h);
			option.material = metalnessMaterial("#999999");
			const p = Tools.rectMesh(option);
			p.translateX(t);
			p.translateY(ph + t + storey * r);
			p.translateZ(t);
			p.rotateX(deg2rad(90));
			container.add(p);
		}
		return container;
	}

	// 冰箱门
	createDoor() {
		const container = new ModelContainer(true, "freezer_door");
		const w = this.size.width;
		const h = this.size.height - this.size.pedestalHeight;
		const d = this.size.dooThinkness;
		const mesh = Tools.shapeMesh(
			(shape) => {
				shape
					.moveTo(0, 0)
					.arc(d, 0, d, -Math.PI, -Math.PI * 1.5, true)
					.moveTo(d, d)
					.lineTo(w - d, d)
					.moveTo(0, 0)
					.arc(w - d, 0, d, -Math.PI * 1.5, 0, true)
					.moveTo(w, 0)
					.lineTo(0, 0);
			},
			[],
			{ depth: h }
		);
		mesh.rotateX(deg2rad(90));
		mesh.translateY(this.size.depth - d);
		mesh.translateZ(-h - this.size.pedestalHeight);
		container.add(mesh);
		container.add(this.createDoorknob());
		return container;
	}

	private doorknobPath(path: Shape | Path, x: number, y: number, w: number, h: number) {
		const r = h / 2;
		path.setFromPoints([new Vector2(x, y)]);
		path
			.moveTo(x, y)
			.lineTo(x, y + h)
			.lineTo(x + w - r, y + h)
			.moveTo(0, 0)
			.arc(x + w - r, y + r, r, -Math.PI * 1.5, Math.PI * 0.5, true)
			.moveTo(x + w - r, y)
			.lineTo(x, y);
		return path;
	}

	// 门把手
	createDoorknob() {
		const container = new ModelContainer(true, "freezer_door_doorknob");
		const d = this.size.dooThinkness * 0.9;
		const edgeRadius = d / 2;
		const w = this.size.width * 0.5 - edgeRadius;
		const h = this.size.height * 0.12;
		const bw = h * 0.25; // 边框宽度
		const mainMaterial = new MeshPhysicalMaterial({ color: "#00305f", metalness: 0.7, roughness: 0.5 });
		const mesh = Tools.shapeMesh(
			(shape) => {
				this.doorknobPath(shape, 0, 0, w, h);
			},
			[],
			{ depth: d },
			mainMaterial
		);
		const inner = Tools.shapeMesh(
			(shape) => {
				this.doorknobPath(shape, 0, 0, w - bw - bw, h - bw - bw);
			},
			[],
			{ depth: d },
			new MeshPhysicalMaterial({ color: "#666666", metalness: 0.7, roughness: 0.5 })
		);
		inner.translateX(bw);
		inner.translateY(bw);
		inner.translateZ(d * 0.05);

		const edge = Tools.shapeMesh(
			(shape) => {
				shape.moveTo(0, 0).arc(0, 0, edgeRadius, 0, Math.PI * 2, true);
			},
			[],
			{ depth: h },
			mainMaterial
		);
		edge.rotateX(deg2rad(-90));
		edge.translateY(-edgeRadius);
		container.add(mesh, inner, edge);
		container.translateX(edgeRadius / 2);
		container.translateY(this.size.pedestalHeight + (this.size.height - this.size.pedestalHeight) / 2);
		container.translateZ(this.size.depth - d / 1.5);
		return container;
	}

	addTag() {
		if (this.tag === undefined) return;
		const loader = new FontLoader();
		loader.load("font.json", (font) => {
			const text = new TextGeometry(this.tag!.toString(), {
				font,
				size: 1,
				height: 0.1,
				bevelEnabled: false,
			});
			const meshMaterial = new MeshBasicMaterial({
				color: "#0080FF",
				transparent: true,
				opacity: 0.9,
			});
			const mesh = new Mesh(text, meshMaterial);
		});
	}

	addLog() {
		const container = new ModelContainer(true, "freezer_log");

		const d = this.size.depth;
		const w = this.size.width;
		const h = this.size.height;
		const fontHeight = 0.125;

		const pw = 3.328;
		const ph = 0.998;

		const panelOption = new RectMeshOption(pw, ph, fontHeight);
		panelOption.material = metalnessMaterial("#f5f5f5");
		const panel = Tools.rectMesh(panelOption);
		container.add(panel);

		const loader = new FontLoader();
		loader.load("font.json", (font) => {
			const text = new TextGeometry("Haier", {
				font,
				size: 0.6,
				height: fontHeight,
				bevelEnabled: false,
			});
			const meshMaterial = new MeshBasicMaterial({
				color: "#00305f",
				transparent: true,
				opacity: 0.9,
			});
			const fontMesh = new Mesh(text, meshMaterial);
			fontMesh.translateX(0.55);
			fontMesh.translateY(0.28);
			fontMesh.translateZ(fontHeight / 2);
			container.add(fontMesh);
			container.translateX(w * 0.74);
			container.translateY(h * 0.95);
			container.translateZ(d + fontHeight / 2);
			this.door.add(container);
			mainScene.render();
		});
	}

	render() {
		const pedestal = this.createPedestal();
		const container = this.createContainer();
		const rowClapboards = this.createRowClapboards();
		this.door = this.createDoor();
		this.add(pedestal, container, rowClapboards, this.door);
		this.addLog();
	}

	openCloseDoor(open?: boolean) {
		if (open === undefined) open = !this._opening;
		const s0 = { rad: 0 };
		const s1 = { rad: deg2rad(10) };
		const from = open ? s0 : s1;
		const to = open ? s1 : s0;
		const size = this.size;
		const axis = new Vector3(0, size.height, 0);
		axis.normalize();
		Tools.animate(from, to, (state) => {
			this.door.rotateOnAxis(axis, state.rad);
			mainScene.render();
		});
		this._opening = open;
	}

	get boxSize() {
		return { width: this.size.width, height: this.size.height, depth: this.size.depth };
	}

	// 根据子节点的 innsertPosition 计算子节点的偏移（translate）
	getDefaultChildNodeTranslate(childNode: NestedContainer): Position3 {
		return { x: 0, y: 0, z: 0 };
	}

	// 显示当前模型的操作面板 （当前节点被选中时调用此方法）
	showOperationPanel(): void {
		globalPanel.render({
			title: "冰箱",
			labelValuePairs: [
				{ label: "行数", value: `${this.rows} 行` },
				{ label: "列数", value: `${this.cols} 列` },
			],
			buttonGroup: [
				{ label: "关闭", onclick: () => this.close() },
				{ label: "移除", onclick: () => this.destroyAndShowParentNode(), danger: true },
			],
		});
	}

	// 获取点击事件触发位置
	get eventRegion(): ModelContainer | null {
		return this;
	}

	childNodeFocusSwitchingAnimate(childNode: NestedContainer, focus: boolean) {
		this.focus({ multipleY: 0.6, multipleZ: 2.5 });
	}

	createChildNode() {
		return new Rack();
	}
}
