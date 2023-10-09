import { DoubleSide, ExtrudeGeometry, Material, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Path, Shape } from "three";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export enum MaterialType {
	MeshPhong,
	MeshPhysical,
	MeshBasic,
	MeshDepth,
	MeshLambert,
}

export const SLIVER = "#FFF5EE";

export function metalnessMaterial(color = SLIVER): Material {
	return new MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.5, side: DoubleSide });
}

export class RectMeshOption {
	constructor(width: number, height: number, depth: number = 0.1) {
		this.width = width;
		this.height = height;
		this.depth = depth;
	}
	width: number;
	height: number;
	depth: number;
	origin = { x: 0, y: 0 }; // 源点
	material: Material = metalnessMaterial(); // 材质
	holes: Path[] = []; // 镂空部分
}

// 角度转弧度
export function deg2rad(deg: number): number {
	return MathUtils.degToRad(deg);
}

export class Tools {
	// 执行一段动画
	static animate<T extends Object>(from: T, to: T, onUpdate: (current: T) => void, duration = 300, easing = Easing.Sinusoidal.InOut): Promise<void> {
		return new Promise((resolve) => {
			const tw = new Tween(from);
			tw.to(to, duration);
			tw.easing(easing);
			tw.onUpdate((current: T) => {
				onUpdate(current);
				requestAnimationFrame(() => tw.update());
			});
			tw.onComplete(() => {
				resolve();
			});
			tw.start();
			tw.update();
		});
	}

	static stretch(shapes: Shape | Shape[], depth: number, material: Material): Mesh {
		const geometry = new ExtrudeGeometry(shapes, { steps: 2, depth });
		const mesh = new Mesh(geometry, material);
		return mesh;
	}

	// 绘制矩形
	static drawRect<T extends Shape | Path>(target: T, leftBottomPoint: { x: number; y: number }, width: number, height: number): T {
		const { x, y } = leftBottomPoint;
		target.moveTo(x, y);
		target.lineTo(x, y + height);
		target.lineTo(x + width, y + height);
		target.lineTo(x + width, y);
		target.lineTo(x, y);
		return target;
	}

	// 绘制网格对象，默认银色金属材质
	static shapeMesh(drawer: (shape: Shape) => void, holes: Path[] = [], depth = 0.1, material: Material = metalnessMaterial()): Mesh {
		const shape = new Shape();
		drawer(shape);
		shape.holes.push(...holes);
		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth, bevelEnabled: false });
		const mesh = new Mesh(geometry, material);
		return mesh;
	}

	// 绘制矩形网格对象，默认银色金属材质
	static rectMesh(option: RectMeshOption): Mesh {
		const shape = Tools.drawRect(new Shape(), option.origin, option.width, option.height);
		shape.holes.push(...option.holes);
		const geometry = new ExtrudeGeometry(shape, { steps: 2, depth: option.depth, bevelEnabled: false });
		const mesh = new Mesh(geometry, option.material);
		return mesh;
	}

	static textMesh(txt: string, params?: Partial<TextGeometryParameters>, material?: Material): Promise<Mesh> {
		return new Promise((resolve) => {
			const loader = new FontLoader();
			loader.load("font.json", (font) => {
				params = { size: 1, height: 0.1, bevelEnabled: false, ...(params ?? {}) };
				const text = new TextGeometry(txt, {
					font,
					...params,
				});
				material =
					material ??
					new MeshBasicMaterial({
						color: "#0080FF",
						transparent: true,
						opacity: 0.9,
					});
				const mesh = new Mesh(text, material);
				resolve(mesh);
			});
		});
	}
}
