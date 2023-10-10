import { appendStyle, createHTMLElement } from "zyc-real-dom";

appendStyle("button", { width: "100px", height: "32px", cursor: "pointer", position: "absolute" });

export function createButton(label: string, handler: (e: MouseEvent) => void) {
	const button = createHTMLElement("button", {}, {});
	button.innerText = label;
	button.onclick = handler;
	return button;
}
