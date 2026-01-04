import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Check, Loader2, XCircle } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  llmEndpoint: string;
  onEndpointChange: (endpoint: string) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  llmEndpoint,
  onEndpointChange,
}) => {
  const [endpoint, setEndpoint] = useState(llmEndpoint);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          prompt: 'Hello',
          stream: false,
        }),
      });
      
      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onEndpointChange(endpoint);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>LLM Settings</DialogTitle>
          <DialogDescription>
            Configure your local LLM connection for the Excel agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">LLM Endpoint URL</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434/api/generate"
            />
            <p className="text-xs text-muted-foreground">
              For Ollama, use: http://localhost:11434/api/generate
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={testConnection} disabled={testing || !endpoint}>
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
            {testResult === 'success' && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Connected
              </div>
            )}
            {testResult === 'error' && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <XCircle className="w-4 h-4" />
                Failed
              </div>
            )}
          </div>
          
          <Card className="p-3 bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Quick Setup Guide</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Install Ollama from ollama.ai</li>
              <li>Run: <code className="bg-background px-1 rounded">ollama run llama3.1</code></li>
              <li>Use endpoint: <code className="bg-background px-1 rounded">http://localhost:11434/api/generate</code></li>
            </ol>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
