import { PipeModel } from "../model/pipe";
import { Panel } from "./panel";

export class PipePanel extends Panel {
	constructor(pipe: PipeModel, onInsert: (e: MouseEvent) => void, onDrop: (e: MouseEvent) => void) {
		super({ width: 300, title: "冻存管" });
		this.pipe = pipe;
		this.render();
		this.addButtonGroup([
			{ label: "放回", onClick: onInsert },
			{ label: "丢弃", onClick: onDrop, danger: true },
		]);
	}

	pipe: PipeModel;

	showInfo() {
		this.showField("行", this.pipe.row);
		this.showField("列", this.pipe.col);
		this.showField("ID", this.pipe.uuid);
	}

	private render() {
		this.showInfo();
	}
}
