import { DoubleSide, ExtrudeGeometry, Mesh, MeshPhongMaterial, MirroredRepeatWrapping, RepeatWrapping, Shape, TextureLoader } from "three";
import { CustomModel } from ".";

export class Floor extends CustomModel {
	constructor() {
		super();
		this.floor();
	}
	width = 100;
	height = 60;
	thickness = 1;
	floorColor = "#666666";

	render: () => void | null;

	floor() {
		const w = this.width;
		const h = this.height;
		const t = this.thickness;
		const x = -(w / 2);
		const y = 0;
		const color = this.floorColor;

		const floor = this.drawRect(new Shape(), { x, y }, w, h);

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
			this.addStructure(mesh, "floor");
			if (this.render) this.render();
		});
	}
}
