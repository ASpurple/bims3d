import { createButton } from ".";
import { SubRack } from "../model/sub_rack";

export function addPipeButton(subRack: SubRack) {
	const button = createButton("添加冻存管", () => {
		console.log(subRack.addPipeAnyWhere());
	});
	button.style.position = "fixed";
	button.style.left = "100px";
	button.style.top = "100px";
	button.style.zIndex = "9";
	document.body.appendChild(button);
}
