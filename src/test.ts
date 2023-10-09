import { Curve, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, Shape, Vector2, Vector3 } from "three";

export class TestShape extends Group {
	constructor() {
		super();
		this.render();
	}

	createRect(x: number, y: number, w: number, h: number, z: number) {
		const shape = new Shape();

		shape
			.moveTo(x, y)
			.lineTo(x, y + h)
			.lineTo(x + w, y + h)
			.lineTo(x + w, y)
			.lineTo(x, y);

		const geometry = new ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
		const material = new MeshBasicMaterial({ color: "orange" });
		const mesh = new Mesh(geometry, material);
		mesh.position.set(x, y, z);
		this.add(mesh);
	}

	render() {
		const step = 0.02;
		let x = 0;
		let y = 0;
		let w = 10;
		let h = 10;
		let z = 0;
		for (let i = 0; i < 50; i++) {
			this.createRect(x, y, w, h, z);
			x = x + step;
			y = y + step;
			w = w - step * 2;
			h = h - step * 2;
			z = z - 0.1;
		}
	}
}
