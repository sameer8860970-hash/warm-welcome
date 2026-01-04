import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Paintbrush,
  Type,
  Hash,
  Percent,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
  numberFormat?: 'general' | 'number' | 'currency' | 'percent';
}

interface FormatToolbarProps {
  format: CellFormat;
  onFormatChange: (format: Partial<CellFormat>) => void;
  hasSelection: boolean;
}

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
  '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6',
  '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7',
];

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  format,
  onFormatChange,
  hasSelection,
}) => {
  return (
    <div className="h-10 border-b border-border bg-muted/30 flex items-center px-2 gap-1">
      <div className="flex items-center gap-0.5">
        <Button
          variant={format.bold ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ bold: !format.bold })}
          disabled={!hasSelection}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={format.italic ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ italic: !format.italic })}
          disabled={!hasSelection}
        >
          <Italic className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="h-6 w-px bg-border mx-1" />
      
      <div className="flex items-center gap-0.5">
        <Button
          variant={format.align === 'left' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ align: 'left' })}
          disabled={!hasSelection}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={format.align === 'center' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ align: 'center' })}
          disabled={!hasSelection}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={format.align === 'right' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ align: 'right' })}
          disabled={!hasSelection}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="h-6 w-px bg-border mx-1" />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasSelection}>
            <Paintbrush className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <p className="text-xs text-muted-foreground mb-2">Background Color</p>
          <div className="grid grid-cols-6 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                  format.bgColor === color && "ring-2 ring-primary"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onFormatChange({ bgColor: color })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasSelection}>
            <Type className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <p className="text-xs text-muted-foreground mb-2">Text Color</p>
          <div className="grid grid-cols-6 gap-1">
            {PRESET_COLORS.slice(6).map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                  format.textColor === color && "ring-2 ring-primary"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onFormatChange({ textColor: color })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="h-6 w-px bg-border mx-1" />
      
      <div className="flex items-center gap-0.5">
        <Button
          variant={format.numberFormat === 'number' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ numberFormat: 'number' })}
          disabled={!hasSelection}
          title="Number format"
        >
          <Hash className="w-4 h-4" />
        </Button>
        <Button
          variant={format.numberFormat === 'currency' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ numberFormat: 'currency' })}
          disabled={!hasSelection}
          title="Currency format"
        >
          <DollarSign className="w-4 h-4" />
        </Button>
        <Button
          variant={format.numberFormat === 'percent' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormatChange({ numberFormat: 'percent' })}
          disabled={!hasSelection}
          title="Percent format"
        >
          <Percent className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1" />
      
      <div className="text-xs text-muted-foreground">
        Formulas: =SUM(A1:A10), =AVERAGE(), =COUNT(), =MIN(), =MAX()
      </div>
    </div>
  );
};
