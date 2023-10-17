import { MeshLambertMaterial, MeshPhysicalMaterial, Material, DoubleSide } from "three";

export function glassMaterial(): Material {
	var material = new MeshLambertMaterial({
		color: "#ffffff",
		opacity: 0.8,
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
