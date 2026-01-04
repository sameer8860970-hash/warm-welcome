import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentPanelProps {
  spreadsheetData: { value: string }[][];
  onExecuteAction: (action: string) => void;
  llmEndpoint: string;
  onSettingsClick: () => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  spreadsheetData,
  onExecuteAction,
  llmEndpoint,
  onSettingsClick,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Excel automation agent. I can help you clean data, write formulas, generate summaries, and automate tasks. What would you like to do?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getDataSummary = () => {
    const rows = spreadsheetData.filter(row => row?.some(cell => cell?.value));
    const cols = spreadsheetData[0]?.length || 0;
    return `Data: ${rows.length} rows, ${cols} columns`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context with spreadsheet data
      const dataPreview = spreadsheetData
        .slice(0, 10)
        .map(row => row?.map(cell => cell?.value || '').join('\t'))
        .join('\n');

      const prompt = `You are an Excel automation agent. Here is the current spreadsheet data (first 10 rows):

${dataPreview}

User request: ${input}

Respond with helpful analysis or instructions. If you suggest code actions, wrap them in \`\`\`action blocks.`;

      if (!llmEndpoint) {
        // Demo mode without LLM
        setTimeout(() => {
          const demoResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I understand you want to: "${input}"\n\n${getDataSummary()}\n\n⚠️ **No LLM connected.** Click the settings icon to configure your local LLM endpoint (e.g., Ollama at http://localhost:11434/api/generate).\n\nOnce connected, I can:\n• Analyze your data\n• Suggest formulas\n• Clean and transform data\n• Generate summaries`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, demoResponse]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // Call local LLM (Ollama format)
      const response = await fetch(llmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          prompt: prompt,
          stream: false,
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message?.content || 'No response from LLM',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for executable actions in response
      const actionMatch = data.response?.match(/```action\n([\s\S]*?)\n```/);
      if (actionMatch) {
        onExecuteAction(actionMatch[1]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Failed to connect to LLM. Make sure your local LLM is running.\n\nEndpoint: ${llmEndpoint}\n\nError: ${error instanceof Error ? error.message : 'Connection failed'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-80 border-l border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Excel Agent</h3>
            <p className="text-xs text-muted-foreground">
              {llmEndpoint ? 'Connected' : 'No LLM connected'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                message.role === 'assistant' ? "bg-primary/10" : "bg-secondary"
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="w-3 h-3 text-primary" />
                ) : (
                  <User className="w-3 h-3 text-secondary-foreground" />
                )}
              </div>
              <Card className={cn(
                "p-3 max-w-[85%] text-sm",
                message.role === 'user' && "bg-primary text-primary-foreground"
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <Card className="p-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {getDataSummary()}
        </p>
      </div>
    </div>
  );
};
