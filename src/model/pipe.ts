/* 冻存管模型 */

import { MeshLambertMaterial, MeshPhysicalMaterial } from "three";
import { pipeSize } from "../store/size";
import { Tools } from "../utils/tools";
import { glassMaterial, metalnessMaterial } from "../utils/material";
import { NestedContainer } from "./nested_container";
import { ModelContainer } from "./model_container";
import { Position3 } from "../scene";
import { globalPanel } from "../html/single_panel";

export class PipeModel extends NestedContainer {
	constructor(color?: string) {
		super("pipe");
		if (color) this.color = color;
		this.render();
	}

	static readonly modelName = "pipe";

	color = "#0072be"; //盖子颜色
	radius = pipeSize.pipeRadius;
	lidHeight = pipeSize.pipeRadius * 2;
	containerHeight = pipeSize.pipeHeight - this.lidHeight;
	bottomRightHeight = this.radius / 4;
	lid: ModelContainer;

	rows = 0;
	cols = 0;
	readonly isClosedModel: boolean = false;

	lidBlackBottom() {
		const r = this.radius;
		const h = this.bottomRightHeight;
		const material = metalnessMaterial();
		(material as MeshPhysicalMaterial).color.set("#333333");
		const ring = Tools.cylinderMesh(r, r, h, true, 0, Math.PI * 2, material);
		return ring;
	}

	createLid() {
		const lidContainer = new ModelContainer("lid");
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
		const model = new ModelContainer();
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
		this.add(this.lid);
		this.add(this.container());
	}

	get boxSize() {
		const dia = pipeSize.pipeRadius * 2;
		return { width: dia, height: pipeSize.pipeHeight, depth: dia };
	}

	// 根据子节点的 innsertPosition 计算子节点的偏移（translate）
	getDefaultChildNodeTranslate(childNode: NestedContainer): Position3 {
		return { x: 0, y: 0, z: 0 };
	}

	// 显示当前模型的操作面板 （当前节点被选中时调用此方法）
	showOperationPanel(): void {
		const row = this.innsertPosition.row + 1;
		const col = this.innsertPosition.col + 1;
		globalPanel.render({
			title: "冻存架 / 内部冻存架 / 冻存管",
			labelValuePairs: [
				{ label: "所在行", value: `第 ${row} 行` },
				{ label: "所在列", value: `第 ${col} 列` },
			],
			buttonGroup: [
				{ label: "放回", onclick: () => this.close() },
				{ label: "移除", onclick: () => this.destroyAndShowParentNode(), danger: true },
			],
		});
	}

	// 获取点击事件触发位置
	get eventRegion(): ModelContainer | null {
		return this.lid;
	}

	childNodeFocusSwitchingAnimate() {}

	createChildNode() {
		return undefined;
	}
}
