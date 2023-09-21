import { WebGLRenderer } from "three";
import { appendStyle, createHTMLElement } from "zyc-real-dom";
import { Room } from "./room";

function createCanvas() {
	const app = document.querySelector("#app");
	if (!app) return null;
	appendStyle("body,html", { margin: "0", padding: "0", width: "100%", height: "100%", overflow: "hidden" });
	const canvas = createHTMLElement("canvas", { id: "canvas", width: window.innerWidth.toString(), height: window.innerHeight.toString() });
	app.appendChild(canvas);
	return canvas;
}

function createRender() {
	const canvas = createCanvas();
	if (!canvas) return null;
	const renderer = new WebGLRenderer({ canvas, antialias: true });
	renderer.setClearColor("#000");
	renderer.clear();
	const devicePixelRatio = window.devicePixelRatio;
	renderer.setPixelRatio(devicePixelRatio);
	return renderer;
}

let last = 0;

function render() {
	const renderer = createRender();
	if (!renderer) return;
	const room = new Room(renderer);
	room.addOrbitControl();

	setTimeout(() => room.render(), 300);

	document.body.onmousedown = () => {
		last = new Date().getTime();
	};

	document.onmouseup = (e) => {
		const now = new Date().getTime();
		const diff = now - last;
		if (diff > 200) return;
		room.onRoomClick(e);
	};
}

render();
