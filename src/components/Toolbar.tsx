 import React, { useEffect, useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { 
   Upload, 
   Download, 
   Trash2, 
   FileSpreadsheet,
   Sun,
   Moon,
   Sparkles,
   Coffee
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ToolbarProps {
   onImport: (file: File) => void;
   onExport: () => void;
   onClear: () => void;
   fileName: string;
 }
 
 type Theme = 'light' | 'dark' | 'cream';
 
 export const Toolbar: React.FC<ToolbarProps> = ({
   onImport,
   onExport,
   onClear,
   fileName,
 }) => {
   const [theme, setTheme] = useState<Theme>(() => {
     if (typeof window !== 'undefined') {
       if (document.documentElement.classList.contains('dark')) return 'dark';
       if (document.documentElement.classList.contains('cream')) return 'cream';
     }
     return 'light';
   });
 
   useEffect(() => {
     document.documentElement.classList.remove('dark', 'cream');
     if (theme === 'dark') {
       document.documentElement.classList.add('dark');
     } else if (theme === 'cream') {
       document.documentElement.classList.add('cream');
     }
   }, [theme]);
 
   const cycleTheme = () => {
     setTheme(prev => {
       if (prev === 'light') return 'cream';
       if (prev === 'cream') return 'dark';
       return 'light';
     });
   };
 
   const getThemeIcon = () => {
     switch (theme) {
       case 'dark':
         return <Moon className="w-5 h-5 text-swift-indigo" />;
       case 'cream':
         return <Coffee className="w-5 h-5 text-swift-orange" />;
       default:
         return <Sun className="w-5 h-5 text-swift-yellow" />;
     }
   };
 
   const getThemeLabel = () => {
     switch (theme) {
       case 'dark': return 'Dark mode';
       case 'cream': return 'Cream mode';
       default: return 'Light mode';
     }
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       onImport(file);
     }
     e.target.value = '';
   };
 
   return (
     <div className="h-14 border-b border-border/30 glass flex items-center px-4 gap-3">
       <div className="flex items-center gap-3 text-sm font-semibold">
         <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-swift-green/20 via-swift-teal/10 to-swift-blue/20 flex items-center justify-center ring-1 ring-white/20 shadow-lg">
           <FileSpreadsheet className="w-5 h-5 text-swift-green" />
         </div>
         <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{fileName}</span>
       </div>
       
       <div className="h-8 w-px bg-border/30 mx-2" />
       
       <label>
         <input
           type="file"
           accept=".xlsx,.xls,.csv"
           onChange={handleFileChange}
           className="hidden"
         />
         <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl hover:bg-white/10 hover:shadow-lg transition-all" asChild>
           <span>
             <Upload className="w-4 h-4 text-swift-blue" />
             Import
           </span>
         </Button>
       </label>
       
       <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl hover:bg-white/10 hover:shadow-lg transition-all" onClick={onExport}>
         <Download className="w-4 h-4 text-swift-green" />
         Export
       </Button>
       
       <div className="h-8 w-px bg-border/30 mx-2" />
       
       <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl hover:bg-white/10 hover:shadow-lg transition-all text-swift-red hover:text-swift-red" onClick={onClear}>
         <Trash2 className="w-4 h-4" />
         Clear
       </Button>
       
       <div className="flex-1" />
       
       <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2 glass-subtle px-3 py-1.5 rounded-full">
         <Sparkles className="w-3.5 h-3.5 text-swift-purple" />
         Connect your local LLM for AI features
       </div>
       
       <Button
         variant="ghost"
         size="icon"
         onClick={cycleTheme}
         title={`Current: ${getThemeLabel()}. Click to switch.`}
         className="rounded-xl hover:bg-white/10 hover:shadow-lg transition-all w-10 h-10"
       >
         {getThemeIcon()}
       </Button>
     </div>
   );
 };
