import { appendStyle, createHTMLElement } from "zyc-real-dom";

appendStyle("canvas", { cursor: "pointer" });

export function createButton(label: string, handler: (e: MouseEvent) => void) {
	const button = createHTMLElement("button", {}, {});
	button.innerText = label;
	button.onclick = handler;
	return button;
}
