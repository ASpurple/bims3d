import { MeshPhongMaterial, MeshPhysicalMaterial, Path } from "three";
import { ModelContainer } from "./model_container";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { pipeSize } from "../store/size";
import { matteMaterial } from "../utils/material";

export class Floor extends ModelContainer {
	constructor(width: number, height: number) {
		super("floor");
		this.brickWidth = width / 18;
		this.brickHeight = this.brickWidth;
		this.thickness = pipeSize.pipeRadius / 2;
		this.width = width;
		this.height = height;
		this.floor();
	}
	private width: number;
	private height: number;
	private brickWidth: number;
	private brickHeight: number;
	private thickness: number;
	private floorColor = "#333333";

	private floorPanelMaterial = new MeshPhongMaterial({ color: this.floorColor });

	private createBrick() {
		const w = this.brickWidth;
		const h = this.brickHeight;
		const d = this.thickness;
		const borderWidth = d / 2;
		const borderMeshOption = new RectMeshOption(w + borderWidth * 2, h + borderWidth * 2, d);
		const hole = Tools.drawRect(new Path(), { x: borderWidth, y: borderWidth }, w, h);
		borderMeshOption.holes.push(hole);
		borderMeshOption.material = matteMaterial(this.floorColor);
		const borderMesh = Tools.rectMesh(borderMeshOption);
		const brickPanelOption = new RectMeshOption(w, h, d);
		brickPanelOption.material = this.floorPanelMaterial;
		const brickPanel = Tools.rectMesh(brickPanelOption);
		brickPanel.translateX(borderWidth);
		brickPanel.translateY(borderWidth);
		borderMesh.rotateX(deg2rad(90));
		brickPanel.rotateX(deg2rad(90));
		brickPanel.translateZ(d / 2);
		const container = new ModelContainer("floor_brick");
		container.add(borderMesh, brickPanel);
		return container;
	}

	floor() {
		const floor = new ModelContainer("floor");
		const rows = Math.ceil(this.height / this.brickHeight);
		const cols = Math.ceil(this.width / this.brickWidth);
		const integralTranslateX = -this.width / 2;
		const integralTranslateZ = -this.height / 2;
		for (let r = 0; r < rows; r++) {
			const z = this.brickHeight * r + integralTranslateZ;
			for (let c = 0; c < cols; c++) {
				const x = this.brickWidth * c + integralTranslateX;
				const brick = this.createBrick();
				brick.translateX(x);
				brick.translateZ(z);
				floor.add(brick);
			}
		}
		this.add(floor);
	}
}
