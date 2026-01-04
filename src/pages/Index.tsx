import React, { useState, useCallback } from 'react';
import { Spreadsheet, CellData } from '@/components/Spreadsheet';
import { AgentPanel } from '@/components/AgentPanel';
import { Toolbar } from '@/components/Toolbar';
import { SettingsDialog } from '@/components/SettingsDialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const createEmptyData = (): CellData[][] => {
  return Array.from({ length: 50 }, () => 
    Array.from({ length: 10 }, () => ({ value: '' }))
  );
};

const Index = () => {
  const [data, setData] = useState<CellData[][]>(createEmptyData());
  const [fileName, setFileName] = useState('Untitled.xlsx');
  const [llmEndpoint, setLlmEndpoint] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleImport = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
      
      const newData = createEmptyData();
      jsonData.forEach((row, rowIndex) => {
        if (rowIndex < 50) {
          row.forEach((cell, colIndex) => {
            if (colIndex < 10) {
              newData[rowIndex][colIndex] = { value: String(cell || '') };
            }
          });
        }
      });
      
      setData(newData);
      setFileName(file.name);
      toast.success(`Imported ${file.name}`);
    } catch (error) {
      toast.error('Failed to import file');
    }
  }, []);

  const handleExport = useCallback(() => {
    try {
      const exportData = data.map(row => row.map(cell => cell.value));
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, fileName);
      toast.success(`Exported ${fileName}`);
    } catch (error) {
      toast.error('Failed to export file');
    }
  }, [data, fileName]);

  const handleClear = useCallback(() => {
    setData(createEmptyData());
    setFileName('Untitled.xlsx');
    toast.success('Spreadsheet cleared');
  }, []);

  const handleExecuteAction = useCallback((action: string) => {
    console.log('Executing action:', action);
    toast.info('Action received from agent');
    // Here you would parse and execute the action
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        onImport={handleImport}
        onExport={handleExport}
        onClear={handleClear}
        fileName={fileName}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Spreadsheet data={data} onDataChange={setData} />
        <AgentPanel
          spreadsheetData={data}
          onExecuteAction={handleExecuteAction}
          llmEndpoint={llmEndpoint}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      </div>
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        llmEndpoint={llmEndpoint}
        onEndpointChange={setLlmEndpoint}
      />
    </div>
  );
};

export default Index;
