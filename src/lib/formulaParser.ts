// Formula parser for spreadsheet calculations

type CellGetter = (col: number, row: number) => number;

const COLUMN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  
  const colStr = match[1].toUpperCase();
  const row = parseInt(match[2], 10) - 1;
  
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  col -= 1;
  
  return { col, row };
}

function parseRange(range: string): { start: { col: number; row: number }; end: { col: number; row: number } } | null {
  const [startRef, endRef] = range.split(':');
  if (!startRef || !endRef) return null;
  
  const start = parseCellRef(startRef);
  const end = parseCellRef(endRef);
  
  if (!start || !end) return null;
  return { start, end };
}

function getRangeValues(range: string, getCell: CellGetter): number[] {
  const parsed = parseRange(range);
  if (!parsed) return [];
  
  const values: number[] = [];
  for (let row = parsed.start.row; row <= parsed.end.row; row++) {
    for (let col = parsed.start.col; col <= parsed.end.col; col++) {
      const val = getCell(col, row);
      if (!isNaN(val)) values.push(val);
    }
  }
  return values;
}

function getCellOrRangeValues(arg: string, getCell: CellGetter): number[] {
  arg = arg.trim();
  
  if (arg.includes(':')) {
    return getRangeValues(arg, getCell);
  }
  
  const cellRef = parseCellRef(arg);
  if (cellRef) {
    const val = getCell(cellRef.col, cellRef.row);
    return isNaN(val) ? [] : [val];
  }
  
  const num = parseFloat(arg);
  return isNaN(num) ? [] : [num];
}

export function evaluateFormula(formula: string, getCell: CellGetter): string {
  if (!formula.startsWith('=')) return formula;
  
  const expr = formula.slice(1).trim().toUpperCase();
  
  try {
    // SUM function
    const sumMatch = expr.match(/^SUM\((.+)\)$/i);
    if (sumMatch) {
      const args = sumMatch[1].split(',');
      let total = 0;
      for (const arg of args) {
        const values = getCellOrRangeValues(arg, getCell);
        total += values.reduce((a, b) => a + b, 0);
      }
      return total.toString();
    }
    
    // AVERAGE function
    const avgMatch = expr.match(/^AVERAGE\((.+)\)$/i);
    if (avgMatch) {
      const args = avgMatch[1].split(',');
      const allValues: number[] = [];
      for (const arg of args) {
        allValues.push(...getCellOrRangeValues(arg, getCell));
      }
      if (allValues.length === 0) return '#DIV/0!';
      const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      return avg.toFixed(2);
    }
    
    // COUNT function
    const countMatch = expr.match(/^COUNT\((.+)\)$/i);
    if (countMatch) {
      const args = countMatch[1].split(',');
      let count = 0;
      for (const arg of args) {
        count += getCellOrRangeValues(arg, getCell).length;
      }
      return count.toString();
    }
    
    // MIN function
    const minMatch = expr.match(/^MIN\((.+)\)$/i);
    if (minMatch) {
      const args = minMatch[1].split(',');
      const allValues: number[] = [];
      for (const arg of args) {
        allValues.push(...getCellOrRangeValues(arg, getCell));
      }
      if (allValues.length === 0) return '#VALUE!';
      return Math.min(...allValues).toString();
    }
    
    // MAX function
    const maxMatch = expr.match(/^MAX\((.+)\)$/i);
    if (maxMatch) {
      const args = maxMatch[1].split(',');
      const allValues: number[] = [];
      for (const arg of args) {
        allValues.push(...getCellOrRangeValues(arg, getCell));
      }
      if (allValues.length === 0) return '#VALUE!';
      return Math.max(...allValues).toString();
    }
    
    // Simple cell reference
    const cellRef = parseCellRef(expr);
    if (cellRef) {
      const val = getCell(cellRef.col, cellRef.row);
      return isNaN(val) ? '0' : val.toString();
    }
    
    // Simple arithmetic
    const simpleExpr = expr.replace(/([A-Z]+\d+)/g, (match) => {
      const ref = parseCellRef(match);
      if (ref) {
        const val = getCell(ref.col, ref.row);
        return isNaN(val) ? '0' : val.toString();
      }
      return '0';
    });
    
    // Safe eval for simple math
    const result = Function(`"use strict"; return (${simpleExpr})`)();
    return typeof result === 'number' ? (Number.isInteger(result) ? result.toString() : result.toFixed(2)) : String(result);
    
  } catch (error) {
    return '#ERROR!';
  }
}
