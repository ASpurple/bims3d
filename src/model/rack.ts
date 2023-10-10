import { MeshStandardMaterial } from "three";
import { mainScene } from "../scene";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { CustomModel } from "./custom_model";
import { SLIVER } from "../utils/material";

export class Rack extends CustomModel {
	constructor() {
		super();
		this.setName("rack");
		this.render();
	}

	width: number = 10;
	height: number = 16;
	depth: number = 30;
	eh = this.height / 20; // 边缘高度
	thickness = 0.1;

	panel() {
		const panel = new CustomModel(this.groupId);

		const w = this.width;
		const h = this.eh;
		const d = this.depth;
		const p2 = Tools.rectMesh(new RectMeshOption(d, h));
		const p3 = Tools.rectMesh(new RectMeshOption(w, h));
		const p4 = Tools.rectMesh(new RectMeshOption(d, h));
		const p5 = Tools.rectMesh(new RectMeshOption(w, d));

		p2.translateX(w - this.thickness);
		p2.rotateY(deg2rad(90));
		p3.translateZ(-d);
		p4.rotateY(deg2rad(90));
		p5.translateY(h);
		p5.rotateX(-deg2rad(90));
		panel.add(p2, p3, p4, p5);

		return panel;
	}

	mid(parent: CustomModel) {
		const panel = Tools.rectMesh(new RectMeshOption(this.width, this.depth));
		panel.translateY(this.height / 2);
		panel.rotateX(-deg2rad(90));
		const c1 = Tools.rectMesh(new RectMeshOption(this.depth, this.eh));
		const c2 = Tools.rectMesh(new RectMeshOption(this.depth, this.eh));

		const ty = this.height / 2 - this.eh / 2;
		c1.translateY(ty);
		c2.translateY(ty);

		c1.rotateY(deg2rad(90));
		c2.translateX(this.width - this.thickness);
		c2.rotateY(deg2rad(90));
		parent.add(panel, c1, c2);
	}

	banding(parent: CustomModel) {
		const w = this.width / 5;
		const h = this.height + this.eh * 2;
		const p1 = Tools.rectMesh(new RectMeshOption(this.depth / 10, this.height));
		const p2 = Tools.rectMesh(new RectMeshOption(this.depth / 10, this.height));
		const p3 = Tools.rectMesh(new RectMeshOption(w, h));
		const p4 = Tools.rectMesh(new RectMeshOption(w, h));
		const p5 = Tools.rectMesh(new RectMeshOption(w, h));
		const p6 = Tools.rectMesh(new RectMeshOption(w, h));
		p1.rotateY(deg2rad(90));
		p2.translateX(this.width - this.thickness);
		p2.rotateY(deg2rad(90));

		p3.translateZ(-this.depth);
		p4.translateZ(-this.depth);
		p5.translateZ(-this.depth);
		p6.translateZ(-this.depth);
		p3.translateY(-this.eh);
		p4.translateY(-this.eh);
		p5.translateY(-this.eh);
		p6.translateY(-this.eh);
		p5.translateX(this.width - w);
		p6.translateX(this.width);

		p4.translateX(this.thickness);
		p4.rotateY(deg2rad(-90));
		p6.rotateY(deg2rad(-90));
		parent.add(p1, p2, p3, p4, p5, p6);
	}

	addLogo(parent: CustomModel) {
		const size = this.width / 6.5;
		const height = this.thickness;
		const material = new MeshStandardMaterial({ color: SLIVER, metalness: 1, roughness: 0.48 });
		Tools.textMesh("Haier", { size, height }, material).then((mesh) => {
			mesh.translateX(this.width / 4);
			mesh.translateY(this.height + 1 - this.thickness);
			mesh.translateZ(-this.height / 10);
			mesh.rotateX(-deg2rad(90));
			parent.add(mesh);
			mainScene.render();
		});
	}

	render() {
		const container = new CustomModel(this.groupId);

		const top = this.panel();
		const bottom = this.panel();
		top.translateY(this.height);
		bottom.rotateZ(deg2rad(180));
		bottom.translateX(-this.width);
		container.add(top, bottom);
		this.mid(container);
		this.banding(container);
		this.addLogo(container);
		this.add(container);

		container.translateZ(this.depth);
		container.translateY(this.eh);
	}
}
