import { BOARD_CONFIG, Row, Column, LUDO_COLORS } from './constants';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts a cell label (e.g., "A1", "H14") to pixel coordinates at the center of the cell
 */
export function center(label: string, cellSize: number, padding: number, showHeaders: boolean = true): Position {
  const row = label[0] as Row;
  const col = parseInt(label.slice(1)) as Column;
  
  const rowIndex = BOARD_CONFIG.ROWS.indexOf(row);
  const colIndex = BOARD_CONFIG.COLUMNS.indexOf(col);
  
  if (rowIndex === -1 || colIndex === -1) {
    throw new Error(`Invalid label: ${label}`);
  }
  
  // Calculate center position - only include headers if showHeaders is true
  const headerSize = showHeaders ? cellSize * 0.6 : 0;
  const x = padding + headerSize + (colIndex * cellSize) + (cellSize / 2);
  const y = padding + headerSize + (rowIndex * cellSize) + (cellSize / 2);
  
  return { x, y };
}

/**
 * Calculates dimensions for rectangular areas (homes, white squares)
 */
export function cellRect(
  rows: readonly [Row, Row], 
  cols: readonly [number, number], 
  cellSize: number, 
  padding: number,
  showHeaders: boolean = true
): Dimensions {
  const startRowIndex = BOARD_CONFIG.ROWS.indexOf(rows[0]);
  const endRowIndex = BOARD_CONFIG.ROWS.indexOf(rows[1]);
  const startColIndex = BOARD_CONFIG.COLUMNS.indexOf(cols[0] as Column);
  const endColIndex = BOARD_CONFIG.COLUMNS.indexOf(cols[1] as Column);
  
  if (startRowIndex === -1 || endRowIndex === -1 || startColIndex === -1 || endColIndex === -1) {
    throw new Error(`Invalid row/col range: ${rows} x ${cols}`);
  }
  
  const headerSize = showHeaders ? cellSize * 0.6 : 0;
  const x = padding + headerSize + (startColIndex * cellSize);
  const y = padding + headerSize + (startRowIndex * cellSize);
  const width = (endColIndex - startColIndex + 1) * cellSize;
  const height = (endRowIndex - startRowIndex + 1) * cellSize;
  
  return { x, y, width, height };
}

/**
 * Calculates total canvas dimensions (with extra space for off-board player info)
 */
export function getCanvasDimensions(cellSize: number, padding: number, showHeaders: boolean = true): { width: number; height: number } {
  const headerSize = showHeaders ? cellSize * 0.6 : 0;
  const gridSize = BOARD_CONFIG.GRID_SIZE * cellSize;
  const totalSize = padding * 2 + headerSize + gridSize;
  
  return { width: totalSize, height: totalSize };
}

/**
 * Generates positions for row and column headers
 */
export function generateHeaderPositions(cellSize: number, padding: number) {
  const headerSize = cellSize * 0.6;
  const headerOffset = headerSize / 2;
  
  const rowHeaders = BOARD_CONFIG.ROWS.map((row, index) => ({
    text: row,
    x: padding + headerOffset,
    y: padding + headerSize + (index * cellSize) + (cellSize / 2),
  }));
  
  const colHeaders = BOARD_CONFIG.COLUMNS.map((col, index) => ({
    text: col.toString().padStart(2, '0'),
    x: padding + headerSize + (index * cellSize) + (cellSize / 2),
    y: padding + headerOffset,
  }));
  
  return { rowHeaders, colHeaders };
}

/**
 * Converts hex color to rgba with specified alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/**
 * Generates grid line positions
 */
export function generateGridLines(cellSize: number, padding: number, showHeaders: boolean = true) {
  const headerSize = showHeaders ? cellSize * 0.6 : 0;
  const gridStart = padding + headerSize;
  const gridEnd = gridStart + (BOARD_CONFIG.GRID_SIZE * cellSize);
  
  const verticalLines = [];
  const horizontalLines = [];
  
  // Vertical lines (columns) - skip the first line if no headers to avoid asymmetry
  for (let i = showHeaders ? 0 : 1; i <= BOARD_CONFIG.GRID_SIZE; i++) {
    const x = gridStart + (i * cellSize);
    verticalLines.push({
      points: [x, gridStart, x, gridEnd],
    });
  }
  
  // Horizontal lines (rows)
  for (let i = 0; i <= BOARD_CONFIG.GRID_SIZE; i++) {
    const y = gridStart + (i * cellSize);
    horizontalLines.push({
      points: [gridStart, y, gridEnd, y],
    });
  }
  
  return { verticalLines, horizontalLines };
}