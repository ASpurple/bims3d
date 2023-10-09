import { Group, Material, Mesh, Path, Shape } from "three";
import { isTypedArray } from "three/src/animation/AnimationUtils";
import { generateUUID } from "three/src/math/MathUtils";

type Model = Mesh | CustomModel | Group;

enum ModelType {
	CustomModel,
	Group,
	Mesh,
}

export class CustomModel extends Group {
	constructor(groupId?: string, name?: string) {
		super();
		this.groupId = groupId ?? generateUUID();
		this.userData.name = name ?? "";
	}

	private _origin = { x: 0, y: 0, z: 0 };
	private _models: Model[] = [];
	readonly groupId: string;
	readonly isCustomModel: boolean = true;

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

	// 获取模型类型
	static getModelType(model: Model): ModelType {
		if ((model as CustomModel).isCustomModel) return ModelType.CustomModel;
		if ((model as Group).isGroup) return ModelType.Group;
		return ModelType.Mesh;
	}

	// 获取自定义的模型分组Id
	static getCustomModelGroupId(model: Model): string | null {
		return (model as CustomModel).groupId || (model.userData["groupId"] ?? null);
	}

	// 设置自定义的模型分组Id
	static setCustomModelGroupId(model: Model, groupId: string) {
		if ((model as CustomModel).isCustomModel) return;
		model.userData["groupId"] = groupId;
	}

	// 获取自定义的模型名称
	static getCustomModelName(model: Model): string | null {
		return model.userData["name"] ?? null;
	}

	// 设置自定义的模型名称
	static setCustomModelName(model: Model, name: string) {
		model.userData["name"] = name;
	}

	get models() {
		return this._models;
	}

	set models(list: Model[]) {
		this._models = list;
	}

	get origin() {
		return this._origin;
	}

	set origin(ori: typeof this._origin) {
		this._origin = ori;
	}

	setName(name: string) {
		CustomModel.setCustomModelName(this, name);
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

	// 根据自定义名称查找子模型
	findChildModelByName(name: string): Model | null {
		if (!name) return null;
		if (CustomModel.getCustomModelName(this) === name) return this;
		let result: Model | null = null;
		this.recursionChildModel(this.children as Model[], (model: Model) => {
			if (CustomModel.getCustomModelName(model) === name) {
				result = model;
				return true;
			}
			return false;
		});
		return result;
	}

	// 添加子模型
	addChildModel(model: Model, name: string) {
		if (!CustomModel.getCustomModelGroupId(model)) {
			CustomModel.setCustomModelGroupId(model, this.groupId);
		}
		CustomModel.setCustomModelName(model, name);
		this._models.push(model);
		this.add(model);
	}

	// 删除子模型
	removeChildModel(name: string) {
		if (!name) return;
		const target = this._models.find((model) => CustomModel.getCustomModelName(model) === name);
		const list = this._models.filter((model) => CustomModel.getCustomModelName(model) !== name);
		if (!target) return;
		this.models = list;
		this.remove(target);
	}

	// 删除子模型(深度遍历)
	removeChildModelDeep(name: string) {
		if (!name) return;
		this.recursionChildModel(this.children as Model[], (model: Model) => {
			if (CustomModel.getCustomModelName(model) === name) {
				const parent = (model as Group).parent as CustomModel;
				if (parent) {
					if (CustomModel.getModelType(parent) === ModelType.CustomModel) {
						parent.removeChildModel(name);
					} else {
						parent.remove(model);
					}
				}
				return true;
			}
			return false;
		});
	}

	// 清除子模型
	clearChildModels() {
		this.clear();
		this.models = [];
	}

	// 获取所有网格对象
	getAllMesh = (f?: CustomModel, children?: Mesh[]) => {
		if (!f) f = this;
		if (!children) children = [];
		if (f.children) {
			f.children.forEach((c: any) => {
				if (!c.isGroup && c.isObject3D) children!.push(c);
				if (c.isGroup) {
					this.getAllMesh(c, children);
				}
			});
		}
		return children;
	};
}
