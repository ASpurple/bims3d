import { MeshBasicMaterial } from "three";
import { loading } from "../html/loading";
import { globalPanel } from "../html/single_panel";
import { Position3, mainScene } from "../scene";
import { RoomSize } from "../store/size";
import { randomIn, randomPositions } from "../utils";
import { Tools, deg2rad } from "../utils/tools";
import { Floor } from "./floor";
import { Freezer } from "./freezer";
import { ModelContainer } from "./model_container";
import { FocusMode, NestedContainer } from "./nested_container";
import { PipeModel } from "./pipe";
import { Rack } from "./rack";
import { SubRack } from "./sub_rack";
import { Wall } from "./wall";
import { RENDER_DELAY } from "../store/constant";

export class Room extends NestedContainer {
	constructor(roomSize?: RoomSize) {
		super("room");
		this.size = roomSize ?? new RoomSize();
		this.rows = this.size.rows;
		this.cols = this.size.cols;
		this.render();
	}

	readonly rows: number;
	readonly cols: number;
	readonly isClosedModel: boolean = false;
	size: RoomSize;

	get selected() {
		return true;
	}

	addWall() {
		const doorWidth = 24;
		const { width: w, height: h } = this.size;
		const top = new Wall({ width: w });
		top.translateX(-w / 2);
		top.translateZ(-h / 2);
		const bottom = new Wall({ width: w, doorWidth, materialType: "glass" });
		bottom.translateX(-w / 2);
		bottom.translateZ(h / 2);
		const left = new Wall({ width: h });
		left.translateX(-w / 2);
		left.translateZ(h / 2);
		left.rotateY(deg2rad(90));

		const right = new Wall({ width: h, materialType: "glass" });
		right.translateX(w / 2);
		right.translateZ(h / 2);
		right.rotateY(deg2rad(90));

		const leftMid = new Wall({ width: h, doorWidth, doorOffset: h * 0.7, materialType: "glass" });
		leftMid.translateX(-doorWidth);
		leftMid.translateZ(h / 2);
		leftMid.rotateY(deg2rad(90));

		const rightMid = new Wall({ width: h, doorWidth });
		rightMid.translateX(doorWidth);
		rightMid.translateZ(h / 2);
		rightMid.rotateY(deg2rad(90));

		const container = new ModelContainer("walls");
		container.add(top, bottom, left, right, leftMid, rightMid);
		this.add(container);
	}

	async addHouseNumber(num = "A301") {
		const material = new MeshBasicMaterial({
			color: "#FFFFFF",
		});
		const mesh = await Tools.textMesh(num, { size: 4 }, material);
		mesh.translateX(-4.5);
		mesh.translateY(50 * 0.8 + 3.5);
		mesh.translateZ(this.size.height / 2 + 1);
		this.add(mesh);
		mainScene.render();
	}

	render() {
		this.addWall();
		this.addHouseNumber();
		this.add(new Floor(this.size.width, this.size.height));
	}

	getDefaultChildNodeTranslate(childNode: NestedContainer): Position3 {
		const { width, height, rowSpacing, colSpacing } = this.size;
		const { row, col } = childNode.insertedPosition;
		const baseX = -width / 2;
		const baseZ = -height / 2;
		const x = baseX + colSpacing + col * (childNode.boxSize.width + colSpacing);
		const y = 0;
		const z = baseZ + rowSpacing + row * (childNode.boxSize.depth + rowSpacing);
		return { x, y, z };
	}

	showOperationPanel(): void {
		globalPanel.render({
			title: "房间-1",
			labelValuePairs: [
				{ label: "行数", value: `${this.rows} 行` },
				{ label: "列数", value: `${this.cols} 列` },
			],
			buttonGroup: [
				{
					label: "随机数据",
					onclick: () => {
						if (this.added) return;
						this.addMockData();
					},
				},
				{ label: "全览", onclick: () => mainScene.resetCamera() },
			],
		});
	}

	get eventRegion(): ModelContainer | null {
		return null;
	}

	createChildNode(): NestedContainer | undefined {
		return new Freezer();
	}

	focusBlurCameraAnimation(mode: FocusMode): void {
		console.log(`room camera animation ${mode}`);
	}

	focusBlurAnimation(mode: FocusMode): void {
		console.log(`room animation ${mode}`);
	}

	get boxSize(): { width: number; height: number; depth: number } {
		return { width: this.size.width, height: this.size.depth, depth: this.size.height };
	}

	private added = false;
	// 添加测试数据
	addMockData() {
		loading();
		setTimeout(() => {
			this.added = true;
			this.childNodes.forEach((child) => child.destroy());
			this.showOperationPanel();
			const freezerPositions = randomPositions(this.rows, this.cols, 12, [3, 4], [3]);
			freezerPositions.forEach((p) => {
				const f = this.createChildNode();
				if (!f) return;
				const rackPositions = randomPositions(f.rows, f.cols, randomIn(3, 7));
				rackPositions.forEach((p) => {
					const rack = new Rack();
					const subRackPositions = randomPositions(rack.rows, rack.cols, 2);
					subRackPositions.forEach((p) => {
						const subRack = new SubRack();
						const pipePositions = randomPositions(subRack.rows, subRack.cols, randomIn(2, 16));
						pipePositions.forEach((p) => {
							new PipeModel().insertTo(subRack, p);
						});
						subRack.insertTo(rack, p);
					});
					rack.insertTo(f, p);
				});
				f.insertTo(this, p);
			});
			mainScene.render();
			setTimeout(() => loading(false), RENDER_DELAY);
		}, 100);
	}
}
