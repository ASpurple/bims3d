import { Group, Material, Mesh, Object3D, Object3DEventMap, Path, Shape } from "three";
import { isTypedArray } from "three/src/animation/AnimationUtils";
import { mainScene } from "../scene";

type Model = Mesh | CustomModel | Group;

export class CustomModel extends Group {
	constructor(name?: string) {
		super();
		CustomModel.setCustomModelName(this, name ?? "");
	}

	readonly isCustomModel: boolean = true;

	selected = false; // 在父级中的选中状态

	// 获取网格模型的材质列表
	static getMeshMaterials(mesh: Mesh) {
		let arr: Material[] = [];
		if (isTypedArray(mesh.material)) {
			arr = mesh.material as Material[];
		} else {
			arr = [mesh.material as Material];
		}
		return arr;
	}

	// 获取自定义的模型名称
	static getCustomModelName(model: Model): string {
		return model.userData["name"] ?? "";
	}

	// 设置自定义的模型名称
	static setCustomModelName(model: Model, name: string) {
		model.userData["name"] = name;
	}

	// 查找指定名称的父级
	static findNamedParent(target: any, name: string): Object3D | null {
		if (target && target.userData && target.userData.name === name) return target;
		if (!target.parent) return null;
		return CustomModel.findNamedParent(target.parent, name);
	}

	setName(name: string) {
		CustomModel.setCustomModelName(this, name);
	}

	getName() {
		return CustomModel.getCustomModelName(this);
	}

	// 写入自定义字段
	setField(field: string, value: any) {
		this.userData[field] = value;
	}

	// 读取自定义字段
	getField(field: string): any {
		return this.userData[field];
	}

	// 遍历当前模型的子模型，如果 callback 返回 true， 则停止遍历
	recursionChildModel(children: Model[], callback: (model: Model) => boolean): boolean | undefined {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const finish = callback(child);
			if (finish === true) return finish;
			if (child.children && child.children.length) {
				const recursionFinish = this.recursionChildModel(child.children as Model[], callback);
				if (recursionFinish === true) return recursionFinish;
			}
		}
	}

	// 添加指定名称的子模型
	addNamedModel(model: Model, option: { name: string }) {
		if (option.name) CustomModel.setCustomModelName(model, option.name);
		this.add(model);
	}

	// 获取 children 中的所有3D对象
	getAllObject3D = () => {
		let results: Object3D[] = [];
		const get = (target: Object3D<Object3DEventMap> = this) => {
			if (!target) return;
			if (target.isObject3D && !(target as Group).isGroup) results.push(target);
			if (target.children) target.children.forEach((c) => get(c));
		};
		get(this);
		return results;
	};

	// 递归删除模型的所有事件绑定
	removeAllModelsEvent(target: Object3D<Object3DEventMap> = this) {
		if (target.uuid) mainScene.removeModelEvent(target);
		if (!target.children) return;
		target.children.forEach((c) => c && this.removeAllModelsEvent(c));
	}

	// 重写 remove 方法，删除子元素时自动解除所有事件绑定
	remove(...object: Object3D<Object3DEventMap>[]): this {
		super.remove(...object);
		object.forEach((obj) => this.removeAllModelsEvent(obj));
		return this;
	}

	// 聚焦模型左侧45°角位置	(默认模型的 左下内 点为源点)
	focusLeft45(width: number, height: number, depth: number, distance = 3) {
		const p0 = this.position;
		const w = width;
		const h = height;
		const d = depth;
		const lookAt = { x: p0.x + w / 2, y: p0.y + h / 2, z: p0.z + d / 2 };
		return mainScene.moveCameraTo({ x: p0.x - w * distance, y: p0.y + h * distance, z: p0.z + d * distance }, lookAt);
	}

	// 聚焦模型右侧45°角位置	(默认模型的 左下内 点为源点)
	focusRight45(width: number, height: number, depth: number, distance = 3) {
		const p0 = this.position;
		const w = width;
		const h = height;
		const d = depth;
		const lookAt = { x: p0.x + w / 2, y: p0.y + h / 2, z: p0.z + d / 2 };
		return mainScene.moveCameraTo({ x: p0.x + w * distance, y: p0.y + h * distance, z: p0.z + d * distance }, lookAt);
	}

	// 聚焦模型正前方位置	(默认模型的 左下内 点为源点)
	focusAhead(width: number, height: number, depth: number, distance = 3) {
		const p0 = this.position;
		const w = width;
		const h = height;
		const d = depth;
		const lookAt = { x: p0.x + w / 2, y: p0.y + h / 2, z: p0.z + d / 2 };
		return mainScene.moveCameraTo({ x: p0.x + w / 2, y: p0.y + h * distance, z: p0.z + d * distance }, lookAt);
	}
}
