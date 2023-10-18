class PipeSize {
	private _pipeRadius = 0.5; // 冻存管半径
	private _pipeHeight = 5; // 冻存管高度

	get dia(): number {
		return this._pipeRadius * 2;
	}

	get pipeRadius() {
		return this._pipeRadius;
	}

	set pipeRadius(value: number) {
		this._pipeRadius = value;
	}

	get pipeHeight() {
		return this._pipeHeight;
	}

	set pipeHeight(value: number) {
		this._pipeHeight = value;
	}
}

export const pipeSize = new PipeSize();

export class SubRackSize {
	constructor(row: number, col: number) {
		const pipeRadius = pipeSize.pipeRadius;
		const pipeHeight = pipeSize.pipeHeight;
		this.rowSpace = pipeRadius;
		this.colSpace = pipeRadius * 0.5;
		this.depth = row * pipeRadius * 2 + (row + 1) * this.rowSpace;
		this.width = col * pipeRadius * 2 + (col + 1) * this.colSpace;
		this.height = pipeHeight - pipeRadius * 2.5;
		this.fh = this.height / 8;
		this.holeRadius = pipeRadius;
	}

	rowSpace = 0; // 行间隔
	colSpace = 0; // 列间隔
	width: number = 0;
	height: number = 0;
	depth: number = 0;
	fh = 0; // 每层的侧边铁片高度
	holeRadius = 0;
	thickness = 0.1;
}

export class RackSize {
	constructor(subRackSize: SubRackSize) {
		this.width = subRackSize.width + this.thickness * 2;
		this.height = (subRackSize.height + subRackSize.holeRadius * 2.5) * 2;
		this.depth = subRackSize.depth + subRackSize.holeRadius;
		this.eh = this.height / 20;
	}

	width: number = 10;
	height: number = 16;
	depth: number = 30;
	eh = this.height / 20; // 边缘高度
	thickness = 0.1; // 板材厚度
}

export class FreezerSize {
	constructor(rows: number, cols: number, rackSize: RackSize) {
		this.rows = rows;
		this.cols = cols;
		this.width = rackSize.width * cols + this.colSpacing * (cols - 1) + this.thinkness * 2;
		this.rowStoreyHeight = rackSize.height + this.thinkness + this.rowSpacing;
		const contentHeight = rows * this.rowStoreyHeight + this.thinkness * 2;
		this.pedestalHeight = contentHeight * 0.25;
		this.height = contentHeight + this.pedestalHeight;
		this.dooThinkness = pipeSize.dia;
		this.depth = rackSize.depth + this.dooThinkness + this.depthIndent + this.thinkness;
	}

	rows: number;
	cols: number;
	width: number;
	height: number;
	depth: number;
	rowStoreyHeight: number; // 横向隔板隔开后的每层层高
	dooThinkness: number; // 门板厚度
	pedestalHeight: number; // 底座高度
	thinkness: number = 0.5; // 板材厚度
	depthIndent: number = pipeSize.dia; // 纵深缩进深度
	rowSpacing: number = pipeSize.pipeHeight * 0.5; // 行间隔
	colSpacing: number = pipeSize.dia * 3; // 列间隔
}

export class RoomSize {
	rows: number = 3;
	cols: number = 5;
	width: number = 360;
	height: number = 240;
	depth: number = 180;
	rowSpacing = 54;
	colSpacing = 36;
}
