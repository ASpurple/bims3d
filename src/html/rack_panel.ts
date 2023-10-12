import { Panel } from "./panel";

export class RackPanel extends Panel {
	constructor() {
		super({ width: 380, title: "冻存架" });
	}

	onAddSubRack = () => {};
	onDrawOut = () => {};
	onRemove = () => {};

	showInfo() {
		this.showField("品牌", "海尔");
		this.showField("层数", "2层");
		this.addButton("添加", this.onAddSubRack);
		// this.addButtonGroup([
		// 	{ label: "添加", onClick: this.onAddSubRack },
		// 	{ label: "放回", onClick: this.onDrawOut },
		// 	{ label: "移除", onClick: this.onRemove, danger: true },
		// ]);
	}

	render() {
		this.showInfo();
		this.show();
	}
}
