import { Group, Material, Mesh, Path, Shape } from "three";
import { isTypedArray } from "three/src/animation/AnimationUtils";
import { generateUUID } from "three/src/math/MathUtils";

type Structure = Mesh | CustomModel;

export class CustomModel extends Group {
	constructor(groupId?: string) {
		super();
		this.groupId = groupId ?? generateUUID();
	}

	private origin = { x: 0, y: 0, z: 0 };
	private structures: Structure[] = [];
	readonly groupId: string;

	static getMeshMaterials(mesh: Mesh) {
		let arr: Material[] = [];
		if (isTypedArray(mesh.material)) {
			arr = mesh.material as Material[];
		} else {
			arr = [mesh.material as Material];
		}
		return arr;
	}

	getStructures() {
		return this.structures;
	}

	getOrigin() {
		return this.origin;
	}

	setOrigin(origin: typeof this.origin) {
		this.origin = origin;
	}

	findIndex(name: string) {
		if (!name) return -1;
		for (let i = 0; i < this.structures.length; i++) {
			const mesh = this.structures[i];
			if (mesh.userData.name == name) return i;
		}
		return -1;
	}

	getStructureByName(name: string): Structure | null {
		const i = this.findIndex(name);
		if (i < 0) return null;
		return this.structures[i];
	}

	addStructure(structure: Structure, name = "") {
		structure.userData.groupId = this.groupId;
		let index = -1;
		if (name !== "") {
			structure.userData.name = name;
			index = this.findIndex(name);
		}
		if (index < 0) {
			this.structures.push(structure);
			this.add(structure);
			return;
		}
		this.structures[index] = structure;
		this.children[index] = structure;
	}

	deleteStructure(name: string) {
		if (!name) return;
		const child = this.children.find((c) => c.userData.name == name);
		if (child) this.remove(child);
		this.structures = this.structures.filter((s) => s.userData.name != name);
	}

	clearStructures() {
		this.clear();
		this.structures = [];
	}

	getAllModels = (f?: CustomModel, children?: Mesh[]) => {
		if (!f) f = this;
		if (!children) children = [];
		if (f.children) {
			f.children.forEach((c: any) => {
				if (!c.isGroup && c.isObject3D) children!.push(c);
				if (c.isGroup) {
					this.getAllModels(c, children);
				}
			});
		}
		return children;
	};

	drawRect<T extends Shape | Path>(target: T, leftBottomPoint: { x: number; y: number }, width: number, height: number): T {
		const { x, y } = leftBottomPoint;
		target.moveTo(x, y);
		target.lineTo(x, y + height);
		target.lineTo(x + width, y + height);
		target.lineTo(x + width, y);
		target.lineTo(x, y);
		return target;
	}
}
