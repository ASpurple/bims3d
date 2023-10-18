import { Group, Object3D, Object3DEventMap } from "three";

// ModelContainer 作为一个模型或模型组的容器，任何需要被手动控制的模型都需要用 ModelContainer 类进行包装
export class ModelContainer extends Group {
	constructor(name = "model_container") {
		super();
		this.name = name;
	}

	readonly isModelContainer: boolean = true;
	protected _isRoot: boolean = false; // 在一个嵌套模型组中，是否处于树形结构的根部

	get isRoot() {
		return this._isRoot;
	}

	get rootModel() {
		return this.findRoot(this);
	}

	// 查找最近的 root model
	findRoot(obj: Object3D): ModelContainer {
		if ((obj as any).isRoot) return obj as ModelContainer;
		if (!obj.parent) return this;
		return this.findRoot(obj.parent);
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

	// 写入自定义字段
	setField(field: string, value: any) {
		this.userData[field] = value;
	}

	// 读取自定义字段
	getField(field: string): any {
		return this.userData[field];
	}
}
