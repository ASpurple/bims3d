import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	DirectionalLight,
	AxesHelper,
	AmbientLight,
	Light,
	Vector2,
	Raycaster,
	Mesh,
	Material,
	Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FreezerModel } from "./model/freezer";
import { Floor } from "./model/floor";
import { Tween, Easing } from "three/examples/jsm/libs/tween.module.js";
import { appendStyle, createHTMLElement } from "zyc-real-dom";
import { CustomModel } from "./model";

export class Room {
	constructor(renderer: WebGLRenderer) {
		this.renderer = renderer;
		this.init();
		appendStyle(".view-btn", {
			position: "fixed",
			top: "64px",
			right: "100px",
			width: "100px",
			height: "32px",
			cursor: "pointer",
			zIndex: "9",
			transition: ".2s",
			border: "none",
			borderRadius: "3px",
			boxShadow: "0 2px 4px 0 #ffffff",
			background: "#0080FF",
			color: "#ffffff",
			letterSpacing: "1px",
		});
	}

	renderer: WebGLRenderer;
	scene: Scene;
	camera: PerspectiveCamera;
	cameraParams = { fov: 45, aspect: 1, near: 0.1, far: 1000 };
	light: Light[] = [];
	floor = new Floor();
	freezers: FreezerModel[] = [];
	activeFreezer: FreezerModel | null = null;
	mouse = new Vector2();
	controlor: OrbitControls | null = null;
	cameraLookAt = { x: 0, y: 0, z: 0 };
	cameraPosition0 = { x: 0, y: 80, z: 60 };

	createScene() {
		this.scene = new Scene();
	}

	createCamera() {
		const { fov, aspect, near, far } = this.cameraParams;
		this.camera = new PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.set(this.cameraPosition0.x, this.cameraPosition0.y, this.cameraPosition0.z);
	}

	createLight() {
		const L1 = new DirectionalLight("#ffffff", 3);
		const L2 = new DirectionalLight("#ffffff", 3);
		const L3 = new DirectionalLight("#ffffff", 3);
		const L4 = new DirectionalLight("#ffffff", 3);
		const L5 = new DirectionalLight("#ffffff", 3);
		L1.position.set(5, 20, 3);
		L2.position.set(5, 8, 15);
		L3.position.set(10, 8, 3);
		L4.position.set(-5, 8, 3);
		L5.position.set(0, 50, 50);
		const ambientLight = new AmbientLight("#ffffff", 5);
		this.light = [L1, L2, L3, L4, L5, ambientLight];
	}

	addFreezers() {
		const row = 3;
		const col = 4;
		const x = -38;
		const y = -8;
		const z = -25;
		const w = 10;
		const d = 5;
		const s = 12;
		let i = 1;
		for (let r = 0; r < row; r++) {
			for (let c = 0; c < col; c++) {
				const X = x + (w + s) * c;
				const Z = z + (d + s) * r;
				let tag = i.toString();
				if (tag.length == 1) tag = "0" + i;
				i++;
				const f = new FreezerModel(tag);
				f.render = this.render;
				f.userData.id = r + "-" + c;
				f.userData.isFreezer = true;
				f.position.set(X, y, Z);
				this.freezers.push(f);
			}
		}
	}

	init() {
		this.floor.render = this.render;
		const canvasWidth = this.renderer.domElement.width;
		const canvasHeight = this.renderer.domElement.height;
		this.cameraParams.aspect = canvasWidth / canvasHeight;
		this.createScene();
		this.createCamera();
		this.createLight();
		this.addFreezers();
		this.scene.add(...this.light, ...this.freezers, this.floor);
		// const axisHelper = new AxesHelper(25);
		// this.scene.add(axisHelper);
	}

	render = (e?: any) => {
		if (e) this.cameraLookAt = { ...e.target.target };
		const { x, y, z } = this.cameraLookAt;
		this.camera.lookAt(x, y, z);
		this.renderer.render(this.scene, this.camera);
	};

	addOrbitControl() {
		this.controlor = new OrbitControls(this.camera, this.renderer.domElement);
		this.controlor.addEventListener("change", this.render);
	}

	openCloseDoor(mode: "open" | "close" = "open", cb?: () => void) {
		if (!this.activeFreezer) return;
		const mesh = this.activeFreezer.getStructureByName("door");
		if (!mesh) return;
		const state = { rotation: mesh.rotation.y };
		const tw = new Tween(state);
		tw.to({ rotation: mode === "open" ? -2 : 0 }, 300);
		tw.easing(Easing.Sinusoidal.Out);
		tw.onUpdate((state) => {
			mesh!.rotation.y = state.rotation;
			this.render();
			requestAnimationFrame(() => tw.update());
		});
		tw.onComplete(() => cb && cb());
		tw.start();
		tw.update();
	}

	viewAll = () => {
		this.openCloseDoor("close", () => (this.activeFreezer = null));
		this.moveCameraTo({ x: this.cameraPosition0.x, y: this.cameraPosition0.y, z: this.cameraPosition0.z, cx: 0, cy: 0, cz: 0 }, () => {
			const state = { opacity: 0 };
			const tw = new Tween(state);
			tw.to({ opacity: 1 }, 300);
			tw.easing(Easing.Sinusoidal.InOut);
			tw.onUpdate((state) => {
				this.freezers.forEach((f) => {
					const children = f.getAllModels();
					children.forEach((c) => {
						const m = c.material as Material;
						m.transparent = true;
						m.opacity = m.opacity === 1 ? 1 : state.opacity;
					});
				});
				this.render();
				requestAnimationFrame(() => tw.update());
			});
			tw.onComplete(() => {
				const btn = document.querySelector(".view-btn");
				if (btn) btn.remove();
			});
			tw.start();
			tw.update();
		});
	};

	createViewButton = () => {
		const btn = createHTMLElement("button", { class: "view-btn" });
		btn.innerText = "查看全部";
		btn.onclick = this.viewAll;
		document.body.appendChild(btn);
	};

	moveCameraTo(target: { x: number; y: number; z: number; cx: number; cy: number; cz: number }, cb?: () => void) {
		const p = this.camera.position;
		const c = this.cameraLookAt;
		const current = { x: p.x, y: p.y, z: p.z, cx: c.x, cy: c.y, cz: c.z };
		const tw = new Tween({ ...current });
		tw.to(target, 300);
		tw.easing(Easing.Sinusoidal.InOut);
		tw.onUpdate(({ x, y, z, cx, cy, cz }) => {
			this.camera.position.set(x, y, z);
			this.cameraLookAt = { x: cx, y: cy, z: cz };
			this.render();
			requestAnimationFrame(() => tw.update());
		});
		tw.onComplete(() => {
			cb && cb();
			if (!this.controlor) return;
			this.controlor.target = new Vector3(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z);
		});
		tw.start();
		tw.update();
	}

	moveCameraToActive() {
		if (!this.activeFreezer) return;
		const fp = this.activeFreezer.position;
		const center = { x: fp.x + 5, y: fp.y + 8, z: fp.z + 5 };
		const target = { x: fp.x + 5, y: fp.y + 30, z: fp.z + 50, cx: center.x, cy: center.y, cz: center.z };
		this.moveCameraTo(target, () => {
			this.openCloseDoor();
			this.createViewButton();
		});
	}

	hiddenFreezers = (gid: string | undefined) => {
		if (this.activeFreezer) return;
		const state = { opacity: 1 };
		const tw = new Tween(state);
		tw.to({ opacity: 0 }, 300);
		tw.easing(Easing.Sinusoidal.InOut);
		tw.onUpdate((state) => {
			this.freezers.forEach((f) => {
				const same = f.groupId === gid;
				if (same) this.activeFreezer = f;
				const opacity = same ? 1 : state.opacity;
				f.getAllModels().forEach((ms) => {
					CustomModel.getMeshMaterials(ms).forEach((material) => {
						material.opacity = opacity;
						material.transparent = true;
					});
				});
			});
			this.render();
			requestAnimationFrame(() => tw.update());
		});
		tw.onComplete(() => this.moveCameraToActive());
		tw.start();
		tw.update();
	};

	onRoomClick = (event: MouseEvent) => {
		const raycaster = new Raycaster();
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = raycaster.intersectObjects(this.freezers);
		if (!intersects.length) return;
		const target = intersects[0].object as Mesh;
		const gid = target.userData.groupId;
		this.hiddenFreezers(gid);
	};
}
