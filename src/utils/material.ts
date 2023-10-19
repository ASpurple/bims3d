import { MeshLambertMaterial, MeshPhysicalMaterial, Material, DoubleSide } from "three";

export interface GlassMaterialOption {
	color?: string;
	opacity?: number;
}

export function glassMaterial(option: GlassMaterialOption = {}): Material {
	const color = option.color ?? "#ffffff";
	const opacity = option.opacity ?? 0.8;
	var material = new MeshLambertMaterial({
		color,
		opacity,
		transparent: true,
	});
	return material;
}

export const SLIVER = "#FFF5EE";

export function metalnessMaterial(color = SLIVER): Material {
	return new MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.5, side: DoubleSide });
}

export function matteMaterial(color = "#333333") {
	return new MeshLambertMaterial({ color });
}
