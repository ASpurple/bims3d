export function randomIn(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min);
}

export interface InsertPosition {
	row: number;
	col: number;
}

export function randomPositions(
	rows: number,
	cols: number,
	total: number,
	excludedRows: number[] = [],
	excludedCols: number[] = []
): InsertPosition[] {
	let usefulPositions: InsertPosition[] = [];
	for (let r = 0; r < rows; r++) {
		if (excludedRows.length && excludedRows.includes(r)) continue;
		for (let c = 0; c < cols; c++) {
			if (excludedCols.length && excludedCols.includes(c)) continue;
			usefulPositions.push({ row: r, col: c });
		}
	}
	let results: InsertPosition[] = [];
	while (results.length < total && usefulPositions.length > 0) {
		const index = randomIn(0, usefulPositions.length);
		results.push(usefulPositions[index]);
		usefulPositions = usefulPositions.filter((_, i) => i !== index);
	}
	return results;
}
