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
  Copy,
  History,
  Plus,
  Brain,
  Database,
  Zap,
  Clock,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  detail?: string;
  duration?: number;
  icon?: 'data' | 'analyze' | 'think' | 'action' | 'verify';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  steps?: ThinkingStep[];
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
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
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'in-progress':
      return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    default:
      return <Circle className="w-4 h-4 text-muted-foreground/40" />;
  }
};

const getStepIcon = (iconType?: ThinkingStep['icon']) => {
  switch (iconType) {
    case 'data':
      return <Database className="w-4 h-4" />;
    case 'analyze':
      return <Search className="w-4 h-4" />;
    case 'think':
      return <Brain className="w-4 h-4" />;
    case 'action':
      return <Zap className="w-4 h-4" />;
    case 'verify':
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Wrench className="w-4 h-4" />;
  }
};

const ThinkingIndicator = () => (
  <div className="flex items-center gap-3 text-sm">
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
        <Brain className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full animate-ping" />
    </div>
    <div className="flex flex-col">
      <span className="font-medium text-foreground">Processing...</span>
      <span className="text-xs text-muted-foreground">Agent is thinking</span>
    </div>
  </div>
);

const StepsDisplay = ({ steps, isThinking }: { steps: ThinkingStep[]; isThinking?: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full text-xs hover:bg-muted/50 rounded-md p-1.5 -ml-1.5 transition-colors">
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">Agent Reasoning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{completedSteps}/{steps.length}</span>
          {isThinking && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="mb-3">
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="space-y-1 relative">
          {/* Vertical line connector */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
          
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-2 rounded-lg transition-all relative",
                step.status === 'in-progress' && "bg-primary/5 ring-1 ring-primary/20",
                step.status === 'completed' && "opacity-80",
                step.status === 'pending' && "opacity-40"
              )}
            >
              {/* Step number with icon */}
              <div className={cn(
                "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                step.status === 'completed' && "bg-green-500/20 text-green-600",
                step.status === 'in-progress' && "bg-primary/20 text-primary",
                step.status === 'pending' && "bg-muted text-muted-foreground"
              )}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : step.status === 'in-progress' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    step.status === 'completed' && "text-green-600",
                    step.status === 'in-progress' && "text-primary",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {getStepIcon(step.icon)}
                  </span>
                  <p className={cn(
                    "font-medium text-sm",
                    step.status === 'completed' && "text-green-600 dark:text-green-400",
                    step.status === 'in-progress' && "text-primary"
                  )}>
                    {step.label}
                  </p>
                </div>
                {step.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5 ml-7">{step.detail}</p>
                )}
                {step.duration && step.status === 'completed' && (
                  <p className="text-xs text-muted-foreground mt-0.5 ml-7 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration}ms
                  </p>
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
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New Conversation',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your Excel automation agent. I can help you clean data, write formulas, generate summaries, and automate tasks. What would you like to do?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const setMessages = (updater: (prev: Message[]) => Message[]) => {
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, messages: updater(c.messages), updatedAt: new Date() }
        : c
    ));
  };

  const getDataSummary = () => {
    const rows = spreadsheetData.filter(row => row?.some(cell => cell?.value));
    const cols = spreadsheetData[0]?.length || 0;
    return `Data: ${rows.length} rows, ${cols} columns`;
  };

  const simulateSteps = async (userRequest: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = [
      { id: '1', label: 'Reading spreadsheet data', status: 'pending', detail: 'Scanning all cells and identifying data patterns...', icon: 'data' },
      { id: '2', label: 'Analyzing your request', status: 'pending', detail: `Understanding: "${userRequest.slice(0, 40)}${userRequest.length > 40 ? '...' : ''}"`, icon: 'analyze' },
      { id: '3', label: 'Reasoning through solution', status: 'pending', detail: 'Applying domain knowledge...', icon: 'think' },
    ];
    
    if (userRequest.toLowerCase().includes('sum') || 
        userRequest.toLowerCase().includes('clean') ||
        userRequest.toLowerCase().includes('format') ||
        userRequest.toLowerCase().includes('duplicate')) {
      steps.push({ id: '4', label: 'Preparing action commands', status: 'pending', detail: 'Building executable operations...', icon: 'action' });
      steps.push({ id: '5', label: 'Verifying safety', status: 'pending', detail: 'Checking for potential issues...', icon: 'verify' });
    }
    
    return steps;
  };

  const updateMessageSteps = (messageId: string, stepId: string, status: ThinkingStep['status'], duration?: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.steps) {
        return {
          ...msg,
          steps: msg.steps.map(step => 
            step.id === stepId ? { ...step, status, duration } : step
          )
        };
      }
      return msg;
    }));
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your Excel automation agent. How can I help you today?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setActiveTab('chat');
  };

  const updateConversationTitle = (content: string) => {
    const title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId && c.title === 'New Conversation'
        ? { ...c, title }
        : c
    ));
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    updateConversationTitle(input);

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
      // Simulate step progression with timing
      for (let i = 0; i < steps.length; i++) {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
        updateMessageSteps(thinkingId, steps[i].id, 'in-progress');
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        const duration = Date.now() - startTime;
        updateMessageSteps(thinkingId, steps[i].id, 'completed', duration);
      }

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
        responseContent = `I understand you want to: "${input}"\n\n${getDataSummary()}\n\n⚠️ **No LLM connected.** Click the settings icon to configure your local LLM endpoint (e.g., Ollama at http://localhost:11434/api/generate).\n\nOnce connected, I can:\n• Analyze your data\n• Suggest formulas\n• Clean and transform data\n• Generate summaries`;
      } else {
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

        const actionMatch = data.response?.match(/```action\n([\s\S]*?)\n```/);
        if (actionMatch) {
          onExecuteAction(actionMatch[1]);
        }
      }

      // Stream the response word by word
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, content: '', thinking: false, isStreaming: true }
          : msg
      ));

      const words = responseContent.split(/(\s+)/);
      let currentContent = '';
      
      for (let i = 0; i < words.length; i++) {
        currentContent += words[i];
        const contentToSet = currentContent;
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingId 
            ? { ...msg, content: contentToSet }
            : msg
        ));
        // Variable delay for more natural feel
        const delay = words[i].trim() ? (15 + Math.random() * 25) : 5;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={createNewConversation} title="New conversation">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'history')} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
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
                      <div className="space-y-4">
                        <ThinkingIndicator />
                        {message.steps && <StepsDisplay steps={message.steps} isThinking />}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {message.steps && message.steps.length > 0 && (
                          <StepsDisplay steps={message.steps} />
                        )}
                        <p className="whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                          )}
                        </p>
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
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setActiveTab('chat');
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      conv.id === activeConversationId 
                        ? "bg-primary/10 border-primary/30" 
                        : "hover:bg-muted/50 border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {conv.messages.length} messages
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimeAgo(conv.updatedAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
