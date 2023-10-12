import { PipeModel } from "../model/pipe";
import { Panel } from "./panel";

export class PipePanel extends Panel {
	constructor(pipe: PipeModel, onInsert: (e: MouseEvent) => void, onDrop: (e: MouseEvent) => void) {
		super({ width: 300, title: "冻存管" });
		this.pipe = pipe;
		this.render();
		this.addButtonGroup([
			{ label: "放回", onClick: onInsert },
			{ label: "移除", onClick: onDrop, danger: true },
		]);
		this.setPosition({ top: 286, right: 137 });
	}

	pipe: PipeModel;

	showInfo() {
		this.showField("所在行", this.pipe.row + 1);
		this.showField("所在列", this.pipe.col + 1);
	}

	private render() {
		this.showInfo();
	}
}
