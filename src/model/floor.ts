import { DoubleSide, ExtrudeGeometry, Mesh, MeshPhongMaterial, MirroredRepeatWrapping, RepeatWrapping, Shape, TextureLoader } from "three";
import { CustomModel } from "./custom_model";
import { Tools } from "../utils/tools";
import { mainScene } from "../scene";

export class Floor extends CustomModel {
	constructor() {
		super();
		this.floor();
	}
	private width = 100;
	private height = 60;
	private thickness = 1;
	private floorColor = "#666666";

	floor() {
		const w = this.width;
		const h = this.height;
		const t = this.thickness;
		const x = -(w / 2);
		const y = 0;
		const color = this.floorColor;

		const floor = Tools.drawRect(new Shape(), { x, y }, w, h);

		const geometry = new ExtrudeGeometry(floor, { steps: 2, depth: t });
		const textureLoader = new TextureLoader();
		textureLoader.load("floor.jpg", (texture) => {
			texture.repeat.set(0.1, 0.2);
			texture.wrapS = RepeatWrapping;
			texture.wrapT = MirroredRepeatWrapping;
			const material = new MeshPhongMaterial({ color, side: DoubleSide, map: texture });
			const mesh = new Mesh(geometry, material);
			mesh.position.set(0, -8, -(h / 2));
			mesh.rotateX((90 / (180 * Math.PI)) * 10);
			this.addChildModel(mesh, "floor");
			mainScene.render();
		});
	}
}
