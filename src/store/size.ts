class PipeSize {
	private _pipeRadius = 0.5; // 冻存管半径
	private _pipeHeight = 6; // 冻存管高度

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

export const pipeSize = new PipeSize();
