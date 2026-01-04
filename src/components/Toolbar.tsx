import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  FileSpreadsheet,
  Undo,
  Redo
} from 'lucide-react';

interface ToolbarProps {
  onImport: (file: File) => void;
  onExport: () => void;
  onClear: () => void;
  fileName: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onImport,
  onExport,
  onClear,
  fileName,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    e.target.value = '';
  };

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileSpreadsheet className="w-5 h-5 text-primary" />
        <span>{fileName}</span>
      </div>
      
      <div className="h-6 w-px bg-border mx-2" />
      
      <label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <span>
            <Upload className="w-4 h-4" />
            Import
          </span>
        </Button>
      </label>
      
      <Button variant="ghost" size="sm" className="gap-1" onClick={onExport}>
        <Download className="w-4 h-4" />
        Export
      </Button>
      
      <div className="h-6 w-px bg-border mx-2" />
      
      <Button variant="ghost" size="sm" className="gap-1" onClick={onClear}>
        <Trash2 className="w-4 h-4" />
        Clear
      </Button>
      
      <div className="flex-1" />
      
      <div className="text-xs text-muted-foreground">
        Connect your local LLM for AI features
      </div>
    </div>
  );
};
