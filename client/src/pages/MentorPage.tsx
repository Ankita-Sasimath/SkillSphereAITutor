import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI learning mentor. I'm here to help you achieve your learning goals. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId') || 'demo-user-123';
  const userName = localStorage.getItem('userName') || 'User';

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const res = await apiRequest('POST', '/api/chat', {
        userId,
        message: userMessage,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });
      return await res.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    chatMutation.mutate(input.trim());
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl mb-2" data-testid="page-title">
            AI Learning Mentor
          </h1>
          <p className="text-muted-foreground">
            Get personalized guidance and answers to your learning questions
          </p>
        </div>

        <Card className="flex flex-col h-[calc(100vh-16rem)]">
          <div className="p-4 border-b bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Your Personal AI Mentor</h3>
                <p className="text-sm text-muted-foreground">Always here to help</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="inline-block p-4 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t bg-card/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your learning journey..."
                disabled={chatMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
