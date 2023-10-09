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
	Vector3,
	Object3D,
	Intersection,
	Object3DEventMap,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Tools } from "../utils/tools";
import { appendStyle, createHTMLElement } from "zyc-real-dom";

export interface Position3 {
	x: number;
	y: number;
	z: number;
}

export class Listener {
	constructor(key: string | number, models: Object3D[], handler: (targets: Intersection<Object3D>[]) => void) {
		this.key = key;
		this.models = models;
		this.handler = handler;
	}
	key: string | number;
	models: Object3D[];
	handler: (targets: Intersection<Object3D>[]) => void;
}

// 默认场景
class DefaultScene {
	constructor() {
		this.init();
	}

	private canvas: HTMLCanvasElement;
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private cameraParams = { fov: 45, aspect: 1, near: 0.1, far: 1000 };
	private lights: Light[] = [];
	private mouse = new Vector2();
	private controlor: OrbitControls | null = null;
	private cameraLookAt = { x: 0, y: 0, z: 0 };
	private cameraPosition0 = { x: 0, y: 80, z: 60 }; // 相机初始位置
	private lastMouseDown = 0;
	private listeners: Listener[] = [];
	private listenerModels: Object3D[] = [];

	private createCanvas() {
		const app = document.querySelector("#app");
		if (!app) return null;
		appendStyle("body,html", { margin: "0", padding: "0", width: "100%", height: "100%", overflow: "hidden" });
		const attr = { id: "canvas", width: window.innerWidth.toString(), height: window.innerHeight.toString() };
		const canvas = createHTMLElement("canvas", attr);
		app.appendChild(canvas);
		this.canvas = canvas as HTMLCanvasElement;
	}

	private createRenderer() {
		const canvas = this.canvas;
		if (!canvas) return;
		const renderer = new WebGLRenderer({ canvas, antialias: true });
		renderer.setClearColor("#000000");
		renderer.clear();
		const devicePixelRatio = window.devicePixelRatio;
		renderer.setPixelRatio(devicePixelRatio);
		this.renderer = renderer;
	}

	private createScene() {
		this.scene = new Scene();
	}

	private createCamera() {
		const w = this.canvas.width;
		const h = this.canvas.height;
		this.cameraParams.aspect = w / h;
		const { fov, aspect, near, far } = this.cameraParams;
		this.camera = new PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.set(this.cameraPosition0.x, this.cameraPosition0.y, this.cameraPosition0.z);
	}

	private createLight() {
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
		const ambientLight = new AmbientLight("#ffffff", 10);
		this.lights = [L1, L2, L3, L4, L5, ambientLight];
	}

	private createHelper() {
		const axisHelper = new AxesHelper(25);
		this.scene.add(axisHelper);
	}

	private init() {
		this.createCanvas();
		this.createRenderer();
		this.createScene();
		this.createCamera();
		this.createLight();
		this.scene.add(...this.lights);
		this.createHelper();
		this.addOrbitControl();
		this.onCanvasClick();
	}

	private addOrbitControl() {
		this.controlor = new OrbitControls(this.camera, this.renderer.domElement);
		this.controlor.addEventListener("change", this.render);
	}

	// 获取渲染器
	getRenderer() {
		return this.renderer;
	}

	// 获取场景实例
	getScene() {
		return this.scene;
	}

	// 获取相机实例
	getCamera() {
		return this.camera;
	}

	// 获取当前所有灯光
	getLights() {
		return this.lights;
	}

	// 重新设置所有灯光
	setLights(lights: Light[]) {
		this.lights.forEach((lig) => lig.remove());
		this.lights = lights;
		this.scene.add(...lights);
	}

	// 场景内添加模型或灯光等
	add(...object: Object3D<Object3DEventMap>[]) {
		this.scene.add(...object);
	}

	render = (e?: any) => {
		if (e) this.cameraLookAt = { ...e.target.target };
		const { x, y, z } = this.cameraLookAt;
		this.camera.lookAt(x, y, z);
		this.renderer.render(this.scene, this.camera);
	};

	moveCameraTo(position: Position3, lookAt: Position3): Promise<void> {
		return new Promise((resolve) => {
			const p = this.camera.position;
			const c = this.cameraLookAt;
			const current = { x: p.x, y: p.y, z: p.z, cx: c.x, cy: c.y, cz: c.z };
			const target = { x: position.x, y: position.y, z: position.z, cx: lookAt.x, cy: lookAt.y, cz: lookAt.z };

			Tools.animate(current, target, ({ x, y, z, cx, cy, cz }) => {
				this.camera.position.set(x, y, z);
				this.cameraLookAt = { x: cx, y: cy, z: cz };
				this.render();
			}).then(() => {
				if (this.controlor) {
					this.controlor.target = new Vector3(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z);
				}
				resolve();
			});
		});
	}

	private onCanvasClick = () => {
		if (!this.canvas) return;
		this.canvas.onmousedown = () => {
			this.lastMouseDown = new Date().getTime();
		};

		this.canvas.onmouseup = (e) => {
			const now = new Date().getTime();
			const diff = now - this.lastMouseDown;
			if (diff > 200) return;
			this.clickHandler(e);
		};
	};

	private clickHandler = (event: MouseEvent) => {
		const raycaster = new Raycaster();
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = raycaster.intersectObjects(this.listenerModels);
		if (!intersects.length) return;
		this.listeners.forEach((lis) => {
			lis.handler(intersects);
		});
	};

	private syncListenerModels() {
		const models: Object3D[] = [];
		this.listeners.forEach((lis) => {
			models.push(...lis.models);
		});
		this.listenerModels = models;
	}

	addEventListener(listener: Listener) {
		const i = this.listeners.findIndex((lis) => lis.key === listener.key);
		if (i >= 0) {
			this.listeners[i] = listener;
		} else {
			this.listeners.push(listener);
		}
		this.syncListenerModels();
	}

	removeEventListener(key: string | number) {
		this.listeners = this.listeners.filter((lis) => lis.key !== key);
		this.syncListenerModels();
	}
}

// 主场景
export const mainScene = new DefaultScene();
