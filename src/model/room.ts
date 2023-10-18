import { globalPanel } from "../html/single_panel";
import { Position3, mainScene } from "../scene";
import { RoomSize } from "../store/size";
import { Floor } from "./floor";
import { Freezer } from "./freezer";
import { ModelContainer } from "./model_container";
import { FocusPosition, NestedContainer } from "./nested_container";

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
	size: RoomSize;

	get selected() {
		return true;
	}

	render() {
		this.add(new Floor(this.size.width, this.size.height));
	}

	getDefaultChildNodeTranslate(childNode: NestedContainer): Position3 {
		const { width, height, rowSpacing, colSpacing } = this.size;
		const { row, col } = childNode.innsertPosition;
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
				{ label: "添加", onclick: () => this.addChildNodeAnyWhere() },
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

	childNodeFocusSwitchingAnimate(childNode: NestedContainer, focus: boolean): void {
		if (focus) {
			this.getChildNodes().forEach((c) => {
				if (c !== childNode) c.visible = false;
			});
			childNode.focus({ multipleX: 0.5, multipleY: 0.5, multipleZ: 2.5, cameraPosition: FocusPosition.left_45 });
		} else {
			this.getChildNodes().forEach((c) => {
				if (c !== childNode) c.visible = true;
			});
			mainScene.resetCamera();
		}
		(childNode as Freezer).openCloseDoor();
	}

	get boxSize(): { width: number; height: number; depth: number } {
		return { width: this.size.width, height: this.size.depth, depth: this.size.height };
	}
}
