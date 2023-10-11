/* 冻存管模型 */

import { MeshLambertMaterial, MeshPhysicalMaterial } from "three";
import { pipeSize } from "../store/size";
import { Tools } from "../utils/tools";
import { CustomModel } from "./custom_model";
import { glassMaterial, metalnessMaterial } from "../utils/material";

export class PipeModel extends CustomModel {
	constructor(color?: string) {
		super();
		if (color) this.color = color;
		this.setName(PipeModel.modelName);
		this.render();
	}

	static readonly modelName = "pipe";

	color = "#0072be"; //盖子颜色
	radius = pipeSize.pipeRadius;
	lidHeight = pipeSize.pipeRadius * 2;
	containerHeight = pipeSize.pipeHeight - this.lidHeight;
	bottomRightHeight = this.radius / 4;
	lid: CustomModel;

	row = 1; // 在冻存架中的行
	col = 1; // 在冻存架中的列

	lidBlackBottom() {
		const r = this.radius;
		const h = this.bottomRightHeight;
		const material = metalnessMaterial();
		(material as MeshPhysicalMaterial).color.set("#333333");
		const ring = Tools.cylinderMesh(r, r, h, true, 0, Math.PI * 2, material);
		return ring;
	}

	createLid() {
		const lidContainer = new CustomModel();
		const r = this.radius;
		const material = new MeshLambertMaterial({ color: this.color });
		const h = this.lidHeight - this.bottomRightHeight;
		const th = this.bottomRightHeight / 2;
		const top = Tools.cylinderMesh(r - th, r, th, false, 0, Math.PI * 2, material);
		top.translateY(h / 2 + th / 2);
		const mesh = Tools.cylinderMesh(r, r, h, false, 0, Math.PI * 2, material);
		const bottom = this.lidBlackBottom();
		bottom.translateY(-h / 2 - this.bottomRightHeight / 2);
		lidContainer.add(top, mesh, bottom);
		lidContainer.translateY(this.containerHeight + this.lidHeight / 2);
		return lidContainer;
	}

	container() {
		const model = new CustomModel();
		const r1 = this.radius * 0.9;
		const h1 = this.containerHeight * 0.9;
		const r2 = this.radius * 0.5;
		const h2 = this.containerHeight * 0.1;
		const material = glassMaterial();
		const main = Tools.cylinderMesh(r1, r1, h1, false, 0, Math.PI * 2, material);
		const bottom = Tools.cylinderMesh(r1, r2, h2, false, 0, Math.PI * 2, material);
		bottom.translateY(-this.containerHeight / 2);
		model.add(main, bottom);
		model.translateY(this.containerHeight / 2 + h2 / 2);
		return model;
	}

	render() {
		this.lid = this.createLid();
		this.addNamedModel(this.lid, { name: "pipe_lid" });
		this.add(this.container());
	}
}
