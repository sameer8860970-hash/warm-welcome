import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CellData {
  value: string;
  formula?: string;
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

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data];
    if (!newData[row]) {
      newData[row] = [];
    }
    newData[row][col] = { value, formula: value.startsWith('=') ? value : undefined };
    onDataChange(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
      if (row < INITIAL_ROWS - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditingCell(null);
      if (col < COLUMNS.length - 1) {
        setSelectedCell({ row, col: col + 1 });
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const getCellValue = (row: number, col: number): string => {
    return data[row]?.[col]?.value || '';
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
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
              <td className="bg-muted border border-border p-1 text-center text-muted-foreground font-medium sticky left-0">
                {rowIndex + 1}
              </td>
              {COLUMNS.map((_, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                
                return (
                  <td
                    key={colIndex}
                    className={cn(
                      "border border-border p-0 relative",
                      isSelected && "ring-2 ring-primary ring-inset"
                    )}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={getCellValue(rowIndex, colIndex)}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        onBlur={() => setEditingCell(null)}
                        className="h-7 rounded-none border-0 focus-visible:ring-0 px-1"
                      />
                    ) : (
                      <div className="h-7 px-1 flex items-center truncate">
                        {getCellValue(rowIndex, colIndex)}
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
  );
};
