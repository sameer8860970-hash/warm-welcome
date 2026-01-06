import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Loader2,
  CheckCircle2,
  Circle,
  FileSpreadsheet,
  Search,
  Sparkles,
  Wrench,
  ChevronDown,
  ChevronRight,
  Calculator,
  Trash2,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  detail?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  steps?: ThinkingStep[];
}

interface AgentPanelProps {
  spreadsheetData: { value: string }[][];
  onExecuteAction: (action: string) => void;
  llmEndpoint: string;
  onSettingsClick: () => void;
}

const StepIcon = ({ status }: { status: ThinkingStep['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    case 'in-progress':
      return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const getStepIcon = (label: string) => {
  if (label.toLowerCase().includes('read') || label.toLowerCase().includes('data')) {
    return <FileSpreadsheet className="w-3.5 h-3.5" />;
  }
  if (label.toLowerCase().includes('analyz') || label.toLowerCase().includes('search')) {
    return <Search className="w-3.5 h-3.5" />;
  }
  if (label.toLowerCase().includes('generat') || label.toLowerCase().includes('think')) {
    return <Sparkles className="w-3.5 h-3.5" />;
  }
  return <Wrench className="w-3.5 h-3.5" />;
};

const ThinkingIndicator = () => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="animate-pulse">Thinking...</span>
  </div>
);

const StepsDisplay = ({ steps }: { steps: ThinkingStep[] }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span>Agent Steps</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 pl-1 border-l-2 border-border ml-1">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={cn(
                "flex items-start gap-2 pl-3 py-1 text-xs transition-opacity",
                step.status === 'pending' && "opacity-50"
              )}
            >
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <StepIcon status={step.status} />
                {getStepIcon(step.label)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium",
                  step.status === 'completed' && "text-green-600 dark:text-green-400",
                  step.status === 'in-progress' && "text-primary"
                )}>
                  {step.label}
                </p>
                {step.detail && (
                  <p className="text-muted-foreground truncate">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

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

  const simulateSteps = async (userRequest: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = [
      { id: '1', label: 'Reading spreadsheet data', status: 'pending', detail: 'Scanning cells...' },
      { id: '2', label: 'Analyzing request', status: 'pending', detail: `"${userRequest.slice(0, 30)}..."` },
      { id: '3', label: 'Generating response', status: 'pending', detail: 'Thinking...' },
    ];
    
    // Add action step if request seems actionable
    if (userRequest.toLowerCase().includes('sum') || 
        userRequest.toLowerCase().includes('clean') ||
        userRequest.toLowerCase().includes('format')) {
      steps.push({ id: '4', label: 'Preparing action', status: 'pending', detail: 'Building command...' });
    }
    
    return steps;
  };

  const updateMessageSteps = (messageId: string, stepId: string, status: ThinkingStep['status']) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.steps) {
        return {
          ...msg,
          steps: msg.steps.map(step => 
            step.id === stepId ? { ...step, status } : step
          )
        };
      }
      return msg;
    }));
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const thinkingId = (Date.now() + 1).toString();
    const steps = await simulateSteps(input);
    
    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      thinking: true,
      steps: steps,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate step progression
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
        updateMessageSteps(thinkingId, steps[i].id, 'in-progress');
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        updateMessageSteps(thinkingId, steps[i].id, 'completed');
      }

      // Build context with spreadsheet data
      const dataPreview = spreadsheetData
        .slice(0, 10)
        .map(row => row?.map(cell => cell?.value || '').join('\t'))
        .join('\n');

      const prompt = `You are an Excel automation agent. Here is the current spreadsheet data (first 10 rows):

${dataPreview}

User request: ${input}

Respond with helpful analysis or instructions. If you suggest code actions, wrap them in \`\`\`action blocks.`;

      let responseContent = '';

      if (!llmEndpoint) {
        // Demo mode without LLM
        responseContent = `I understand you want to: "${input}"\n\n${getDataSummary()}\n\n⚠️ **No LLM connected.** Click the settings icon to configure your local LLM endpoint (e.g., Ollama at http://localhost:11434/api/generate).\n\nOnce connected, I can:\n• Analyze your data\n• Suggest formulas\n• Clean and transform data\n• Generate summaries`;
      } else {
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
        responseContent = data.response || data.message?.content || 'No response from LLM';

        // Check for executable actions in response
        const actionMatch = data.response?.match(/```action\n([\s\S]*?)\n```/);
        if (actionMatch) {
          onExecuteAction(actionMatch[1]);
        }
      }

      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, content: responseContent, thinking: false }
          : msg
      ));

    } catch (error) {
      // Replace thinking message with error
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { 
              ...msg, 
              content: `❌ Failed to connect to LLM. Make sure your local LLM is running.\n\nEndpoint: ${llmEndpoint}\n\nError: ${error instanceof Error ? error.message : 'Connection failed'}`,
              thinking: false 
            }
          : msg
      ));
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
    <div className="w-96 border-l border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Excel Agent</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                llmEndpoint ? "bg-green-500" : "bg-yellow-500"
              )} />
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
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                message.role === 'assistant' 
                  ? "bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20" 
                  : "bg-secondary"
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-secondary-foreground" />
                )}
              </div>
              <Card className={cn(
                "p-3 max-w-[85%] text-sm",
                message.role === 'user' && "bg-primary text-primary-foreground"
              )}>
                {message.thinking ? (
                  <div className="space-y-3">
                    <ThinkingIndicator />
                    {message.steps && <StepsDisplay steps={message.steps} />}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.steps && message.steps.length > 0 && (
                      <StepsDisplay steps={message.steps} />
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setInput('Sum all values in column A')}
            disabled={isLoading}
          >
            <Calculator className="w-3 h-3" />
            Sum column A
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setInput('Find and highlight duplicate values in the spreadsheet')}
            disabled={isLoading}
          >
            <Copy className="w-3 h-3" />
            Find duplicates
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setInput('Clean all empty rows from the spreadsheet')}
            disabled={isLoading}
          >
            <Trash2 className="w-3 h-3" />
            Clean empty rows
          </Button>
        </div>
        
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
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {getDataSummary()}
        </p>
      </div>
    </div>
  );
};
