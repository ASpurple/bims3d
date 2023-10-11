import { SubRack } from "../model/sub_rack";
import { Panel } from "./panel";

export class SubRackPanel extends Panel {
	constructor(subRack: SubRack) {
		super({ width: 500, title: "内部冻存架" });
		this.subRack = subRack;
	}

	subRack: SubRack;

	onAddPipe = () => {
		this.subRack.addPipeAnyWhere();
	};

	onInsert = () => {};

	onRemove = () => {};

	showInfo() {
		this.showField("品牌", "海尔");
		this.showField("行数", this.subRack.row + "行");
		this.showField("列数", this.subRack.col + "列");
		this.addButtonGroup([
			{ label: "添加", onClick: this.onAddPipe },
			{ label: "放回", onClick: this.onInsert },
			{ label: "移除", onClick: this.onRemove, danger: true },
		]);
	}

	render() {
		this.showInfo();
		this.show();
	}
}
