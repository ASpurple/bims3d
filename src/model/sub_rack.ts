import { Path } from "three";
import { RectMeshOption, Tools, deg2rad } from "../utils/tools";
import { CustomModel } from "./custom_model";

export class SubRack extends CustomModel {
	constructor() {
		super();
		this.setName("sub_rack");
		this.render();
	}

	width: number = 9.8;
	height: number = 6;
	depth: number = 29;
	fh = this.height / 8; // 每层的侧边高度
	thickness = 0.1;

	floor() {
		const p = Tools.rectMesh(new RectMeshOption(this.width, this.depth));
		const c1 = Tools.rectMesh(new RectMeshOption(this.fh, this.depth));
		const c2 = Tools.rectMesh(new RectMeshOption(this.fh, this.depth));
		const c3 = Tools.rectMesh(new RectMeshOption(this.width, this.height));
		p.translateY(this.thickness);
		p.rotateX(deg2rad(90));
		c1.rotateY(deg2rad(90));
		c1.rotateZ(deg2rad(90));
		c2.translateX(this.width - this.thickness);
		c2.rotateY(deg2rad(90));
		c2.rotateZ(deg2rad(90));
		return [p, c1, c2, c3];
	}

	verticalMesh() {
		const w = this.fh;
		const h = this.height;
		const mesh = Tools.shapeMesh((shape) => {
			shape
				.moveTo(0, 0)
				.lineTo(0, h - w)
				.lineTo(w, h)
				.lineTo(w, 0)
				.lineTo(0, 0);
		});
		return mesh;
	}

	vertical() {
		const v1 = this.verticalMesh();
		const v2 = this.verticalMesh();
		const v3 = this.verticalMesh();
		const v4 = this.verticalMesh();
		v1.translateZ(this.fh);
		v1.rotateY(deg2rad(90));
		v2.translateX(this.width - this.thickness);
		v2.translateZ(this.fh);
		v2.rotateY(deg2rad(90));
		v3.translateX(this.thickness);
		v3.translateZ(this.depth - this.fh);
		v3.rotateY(deg2rad(-90));
		v4.translateZ(this.depth - this.fh);
		v4.translateX(this.width);
		v4.rotateY(deg2rad(-90));
		return [v1, v2, v3, v4];
	}

	topPoleModel() {
		const w = this.depth;
		const h = this.fh;
		const mesh = Tools.shapeMesh((shape) => {
			shape
				.moveTo(h, 0)
				.lineTo(0, h)
				.lineTo(w, h)
				.lineTo(w - h, 0)
				.lineTo(h, 0);
		});
		return mesh;
	}

	topPole() {
		const p1 = this.topPoleModel();
		const p2 = this.topPoleModel();
		p1.translateY(this.height - this.fh);
		p2.translateY(this.height - this.fh);
		p1.translateX(this.thickness);
		p1.rotateY(deg2rad(-90));
		p2.translateX(this.width);
		p2.rotateY(deg2rad(-90));
		return [p1, p2];
	}

	midPole() {
		const w = this.depth;
		const h = this.fh;
		const p1 = Tools.rectMesh(new RectMeshOption(w, h));
		const p2 = Tools.rectMesh(new RectMeshOption(w, h));
		p1.translateY(this.height / 2 - this.fh);
		p2.translateY(this.height / 2 - this.fh);
		p1.translateX(this.thickness);
		p1.rotateY(deg2rad(-90));
		p2.translateX(this.width);
		p2.rotateY(deg2rad(-90));
		return [p1, p2];
	}

	piercedPanel() {
		const w = this.depth;
		const h = this.width;
		const option = new RectMeshOption(w, h);

		const sr = 0.3; // 行间隔
		const sc = 0.6; // 列间隔
		const nh = 3; // 行数
		const nv = 8; // 列数
		const radius = (h - sr * (nh + 1)) / nh / 2;

		for (let i = 0; i < nh; i++) {
			// 行
			const y = sr + radius + i * (radius + sr + radius);
			for (let k = 0; k < nv; k++) {
				// 列
				const x = sc + radius + k * (radius + sc + radius);
				const path = new Path();
				path.ellipse(x, y, radius, radius, 0, 2 * Math.PI, false, 0);
				option.holes.push(path);
			}
		}

		const p1 = Tools.rectMesh(option);
		const p2 = Tools.rectMesh(option);
		p1.translateY(this.height - this.fh / 2);
		p2.translateY(this.height / 2 - this.fh / 2);
		p1.rotateY(deg2rad(-90));
		p2.rotateY(deg2rad(-90));
		p1.rotateX(deg2rad(-90));
		p2.rotateX(deg2rad(-90));

		return [p1, p2];
	}

	door() {
		const p = Tools.rectMesh(new RectMeshOption(this.width, this.height));
		p.translateZ(this.depth);
		return [p];
	}

	render() {
		const container = new CustomModel();
		container.add(...this.floor());
		container.add(...this.vertical());
		container.add(...this.topPole());
		container.add(...this.midPole());
		container.add(...this.piercedPanel());
		container.add(...this.door());
		this.add(container);
	}
}
