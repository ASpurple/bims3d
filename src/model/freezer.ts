/* import { DoubleSide, ExtrudeGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, Path, Shape } from "three";
import { CustomModel } from "./custom_model";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export class FreezerModel extends CustomModel {
	constructor(tag?: string | number) {
		super();
		this.tag = tag;
		this.frame();
		this.backPanel();
		this.door();
		this.addTag();
	}

	private width = 10;
	private height = 16;
	private depth = 5;
	private panelColor = "#FFF5EE";
	private doorColor = "#ffffff";
	private tag?: string | number;

	render: () => void | null;

	frame() {
		const origin = this.getOrigin();
		const structure = this.drawRect(new Shape(), origin, this.width, this.height);

		const inner = this.drawRect(new Path(), { x: origin.x + 1, y: origin.y + 1 }, this.width - 2, this.height - 2);
		structure.holes.push(inner);

		const geometry = new ExtrudeGeometry(structure, { steps: 2, depth: this.depth });
		const material = new MeshPhysicalMaterial({ color: this.panelColor, metalness: 0.9, roughness: 0.3, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		this.addStructure(mesh, "frame");
	}

	backPanel() {
		const _origin = this.getOrigin();
		const origin = { ..._origin, x: _origin.x + 1, y: _origin.y + 1 };
		const width = this.width - 2;
		const height = this.height - 2;
		const depth = 1;
		const color = "#666666";

		const panel = this.drawRect(new Shape(), origin, width, height);

		const geometry = new ExtrudeGeometry(panel, { steps: 2, depth });
		const material = new MeshPhongMaterial({ color, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		this.addStructure(mesh, "backPanel");
	}

	private createDoorknob() {
		const shape = new Shape();
		const x = 0;
		const y = 0;
		const width = 1;
		const height = 3;
		const radius = 0.5;
		shape.moveTo(x, y + radius);
		shape.lineTo(x, y + height - radius);
		shape.quadraticCurveTo(x, y + height, x + radius, y + height);
		shape.lineTo(x + width - radius, y + height);
		shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
		shape.lineTo(x + width, y + radius);
		shape.quadraticCurveTo(x + width, y, x + width - radius, y);
		shape.lineTo(x + radius, y);
		shape.quadraticCurveTo(x, y, x, y + radius);

		const inner = this.drawRect(new Path(), { x, y: y + 0.5 }, width - 0.3, height - 1);
		shape.holes.push(inner);

		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth: 0.2 });
		const material = new MeshPhysicalMaterial({ color: "#FF5151", metalness: 0.8, roughness: 0.3, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.position.set(9, 8.2, 0.5);
		mesh.rotateY(-1.58);
		return mesh;
	}

	createRadiating() {
		const shape = new Shape();
		const x = 0;
		const y = 0;
		const width = 6;
		const height = 2;

		this.drawRect(shape, { x, y }, width, height);

		const ix = 0.1;
		const iy = 0.1;
		const iw = width - ix * 2;
		const ih = 0.2;
		const sp = 0.1;
		for (let i = 0; i < 6; i++) {
			const x = ix;
			const y = iy + (ih + sp) * i;
			shape.holes.push(this.drawRect(new Path(), { x, y }, iw, ih));
		}

		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth: 0.1 });
		const material = new MeshPhysicalMaterial({ color: "#003D79", metalness: 0.8, roughness: 0.3, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.position.set(1, 1, 0.8);
		return mesh;
	}

	createPedestal() {
		const shape = new Shape();
		const x = 0;
		const y = 0;
		const width = 10.2;
		const height = 0.6;
		const radius = 0.1;
		shape.moveTo(x, y + radius);
		shape.lineTo(x, y + height - radius);
		shape.quadraticCurveTo(x, y + height, x + radius, y + height);
		shape.lineTo(x + width - radius, y + height);
		shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
		shape.lineTo(x + width, y + radius);
		shape.quadraticCurveTo(x + width, y, x + width - radius, y);
		shape.lineTo(x + radius, y);
		shape.quadraticCurveTo(x, y, x, y + radius);

		const inner = this.drawRect(new Path(), { x: x + 0.1, y: y + 0.1 }, width - 0.2, 0.4);
		shape.holes.push(inner);

		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth: 2 });
		const material = new MeshPhysicalMaterial({ color: "#003D79", metalness: 0.8, roughness: 0.3, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.rotateX(-1.58);
		mesh.position.set(0, 1, 0.8);
		return mesh;
	}

	createRadiatingPanel() {
		const x = 0;
		const y = 0;
		const width = 6;
		const height = 2;

		const panel = this.drawRect(new Shape(), { x, y }, width, height);
		const geometry = new ExtrudeGeometry(panel, { steps: 2, depth: 0.1 });
		const material = new MeshPhongMaterial({ color: "#000000", side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.position.set(1, 1, 0.7);
		return mesh;
	}

	door() {
		const door = new CustomModel(this.groupId);

		const origin = this.getOrigin();
		const width = this.width;
		const height = this.height;
		const depth = 0.5;
		const color = this.doorColor;

		const panel = this.drawRect(new Shape(), origin, width, height);

		const geometry = new ExtrudeGeometry(panel, { steps: 2, depth });
		const material = new MeshPhysicalMaterial({ color, metalness: 0.9, roughness: 0.3, side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		door.position.set(0, 0, this.depth);
		door.addStructure(mesh, "door-panel");
		door.addStructure(this.createDoorknob(), "doorknob");
		door.addStructure(this.createPedestal(), "door-pedestal");
		door.addStructure(this.createRadiatingPanel(), "radiating-panel");
		door.addStructure(this.createRadiating(), "radiating");
		this.addStructure(door, "door");
	}

	circle() {
		const shape = new Shape();
		shape.arc(0, 0, 2, 0, 2 * Math.PI, false);

		const inner = new Path().arc(0, 0, 1.5, 0, 2 * Math.PI, false);
		shape.holes.push(inner);

		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth: 0.1 });
		const material = new MeshBasicMaterial({ color: "#0080FF", side: DoubleSide });
		const mesh = new Mesh(geometry, material);
		mesh.position.set(5, 16, this.depth - 2.3);
		mesh.rotateX(-1.58);
		this.addStructure(mesh, "circle");
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
			mesh.position.set(4.2, 16.2, this.depth - 2);
			mesh.rotateX(-1.58);
			this.addStructure(mesh, "font");
			this.circle();
			if (this.render) this.render();
		});
	}
}
 */
