import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { evaluateFormula } from '@/lib/formulaParser';
import { FormatToolbar, CellFormat } from './FormatToolbar';

export interface CellData {
  value: string;
  formula?: string;
  format?: CellFormat;
}

interface SpreadsheetProps {
  data: CellData[][];
  onDataChange: (data: CellData[][]) => void;
}

const COLUMNS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 10);
const INITIAL_ROWS = 50;

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ data, onDataChange }) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const getCellNumericValue = useCallback((col: number, row: number): number => {
    const cell = data[row]?.[col];
    if (!cell) return NaN;
    
    const rawValue = cell.formula || cell.value;
    if (rawValue.startsWith('=')) {
      // Avoid infinite recursion by not re-evaluating
      const val = parseFloat(cell.value);
      return isNaN(val) ? 0 : val;
    }
    return parseFloat(rawValue) || 0;
  }, [data]);

  const getDisplayValue = useCallback((row: number, col: number): string => {
    const cell = data[row]?.[col];
    if (!cell) return '';
    
    const rawValue = cell.formula || cell.value;
    
    if (rawValue.startsWith('=')) {
      const result = evaluateFormula(rawValue, getCellNumericValue);
      return formatNumber(result, cell.format?.numberFormat);
    }
    
    return formatNumber(cell.value, cell.format?.numberFormat);
  }, [data, getCellNumericValue]);

  const formatNumber = (value: string, format?: CellFormat['numberFormat']): string => {
    if (!format || format === 'general') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    switch (format) {
      case 'number':
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'currency':
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      case 'percent':
        return (num * 100).toFixed(2) + '%';
      default:
        return value;
    }
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell(null);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
    const cell = data[row]?.[col];
    setEditValue(cell?.formula || cell?.value || '');
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data];
    if (!newData[row]) {
      newData[row] = [];
    }
    const existingFormat = newData[row][col]?.format;
    
    if (value.startsWith('=')) {
      const evaluated = evaluateFormula(value, getCellNumericValue);
      newData[row][col] = { value: evaluated, formula: value, format: existingFormat };
    } else {
      newData[row][col] = { value, format: existingFormat };
    }
    onDataChange(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      handleCellChange(row, col, editValue);
      setEditingCell(null);
      if (row < INITIAL_ROWS - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellChange(row, col, editValue);
      setEditingCell(null);
      if (col < COLUMNS.length - 1) {
        setSelectedCell({ row, col: col + 1 });
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleFormatChange = (formatUpdate: Partial<CellFormat>) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newData = [...data];
    if (!newData[row]) {
      newData[row] = [];
    }
    if (!newData[row][col]) {
      newData[row][col] = { value: '' };
    }
    newData[row][col] = {
      ...newData[row][col],
      format: { ...newData[row][col].format, ...formatUpdate },
    };
    onDataChange(newData);
  };

  const currentFormat = useMemo(() => {
    if (!selectedCell) return {};
    return data[selectedCell.row]?.[selectedCell.col]?.format || {};
  }, [selectedCell, data]);

  const getFormulaBarValue = () => {
    if (!selectedCell) return '';
    const cell = data[selectedCell.row]?.[selectedCell.col];
    return cell?.formula || cell?.value || '';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Formula Bar */}
      <div className="h-9 border-b border-border flex items-center px-2 gap-2 bg-card">
        <div className="w-16 text-center text-sm font-medium text-muted-foreground bg-muted rounded px-2 py-1">
          {selectedCell ? `${COLUMNS[selectedCell.col]}${selectedCell.row + 1}` : ''}
        </div>
        <div className="text-muted-foreground">fx</div>
        <Input
          value={getFormulaBarValue()}
          onChange={(e) => {
            if (selectedCell) {
              handleCellChange(selectedCell.row, selectedCell.col, e.target.value);
            }
          }}
          className="flex-1 h-7 text-sm"
          placeholder="Enter value or formula (e.g., =SUM(A1:A10))"
        />
      </div>

      {/* Format Toolbar */}
      <FormatToolbar
        format={currentFormat}
        onFormatChange={handleFormatChange}
        hasSelection={!!selectedCell}
      />

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-12 min-w-12 bg-muted border border-border p-1 text-center text-muted-foreground font-medium">
                
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="min-w-24 bg-muted border border-border p-1 text-center text-muted-foreground font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: INITIAL_ROWS }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="bg-muted border border-border p-1 text-center text-muted-foreground font-medium sticky left-0 z-[5]">
                  {rowIndex + 1}
                </td>
                {COLUMNS.map((_, colIndex) => {
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  const cell = data[rowIndex]?.[colIndex];
                  const format = cell?.format || {};
                  
                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        "border border-border p-0 relative",
                        isSelected && "ring-2 ring-primary ring-inset z-[1]"
                      )}
                      style={{
                        backgroundColor: format.bgColor,
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <Input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          onBlur={() => {
                            handleCellChange(rowIndex, colIndex, editValue);
                            setEditingCell(null);
                          }}
                          className="h-7 rounded-none border-0 focus-visible:ring-0 px-1"
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-7 px-1 flex items-center truncate",
                            format.bold && "font-bold",
                            format.italic && "italic",
                            format.align === 'center' && "justify-center",
                            format.align === 'right' && "justify-end"
                          )}
                          style={{ color: format.textColor }}
                        >
                          {getDisplayValue(rowIndex, colIndex)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
