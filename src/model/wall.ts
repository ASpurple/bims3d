import { Material, MeshBasicMaterial, Path } from "three";
import { ModelContainer } from "./model_container";
import { RectMeshOption, Tools } from "../utils/tools";
import { glassMaterial, metalnessMaterial } from "../utils/material";

export interface WallOption {
	width: number;
	height: number;
	thinkness: number;
	color: string;
	materialType: "glass" | "normal";
	doorWidth: number;
	doorOffset: number;
}

export class Wall extends ModelContainer {
	constructor(option: Partial<WallOption> = {}) {
		super("wall");
		const width = option.width ?? 180;
		const height = option.height ?? 50;
		const thinkness = option.thinkness ?? 1;
		const doorWidth = option.doorWidth ?? 0;
		const materialType = option.materialType ?? "normal";
		const color = option.color ? option.color : materialType === "glass" ? "#000000" : "#c9c0b3";
		const material = materialType === "glass" ? glassMaterial({ color, opacity: 0.2 }) : new MeshBasicMaterial({ color });
		this.material = material;
		this.wallOption = {
			width,
			height,
			thinkness,
			color,
			materialType,
			doorWidth,
			doorOffset: option.doorOffset ?? (width - doorWidth) * 0.5,
		};
		this.render();
	}

	private wallOption: WallOption;
	private material: Material;

	borderTop() {
		const { width: w, thinkness: t } = this.wallOption;
		const material = metalnessMaterial("#666666");
		const option = new RectMeshOption(w, t, t);
		option.material = material;
		const mesh = Tools.rectMesh(option);
		return mesh;
	}

	createWall() {
		const { width: w, height: h, thinkness: t, doorWidth: dw, doorOffset: df } = this.wallOption;
		const holes: Path[] = [];
		if (dw > 0) {
			const path = new Path();
			const x = df;
			const y = 0;
			const dh = h * 0.8;
			Tools.drawRect(path, { x, y }, dw, dh);
			holes.push(path);
		}
		const wallOption = new RectMeshOption(w, h, t);
		wallOption.material = this.material;
		wallOption.holes = holes;
		const wall = Tools.rectMesh(wallOption);
		const borderTop = this.borderTop();
		borderTop.translateY(h);
		const container = new ModelContainer("wall-model");
		container.add(wall, borderTop);
		return container;
	}

	render() {
		this.add(this.createWall());
	}
}
