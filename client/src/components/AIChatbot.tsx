import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI learning mentor. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");

  const quickSuggestions = [
    "What should I learn next?",
    "Explain this concept",
    "Create a study schedule"
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    console.log('User message:', input);
    
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: "I understand you're asking about that. Let me help you with a personalized recommendation based on your current skill level and learning goals."
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
    
    setInput("");
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col shadow-xl">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Mentor</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => setIsOpen(false)}
          data-testid="button-close-chatbot"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${index}`}
          >
            {message.role === "assistant" && (
              <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover-elevate"
              onClick={() => handleSuggestion(suggestion)}
              data-testid={`suggestion-${index}`}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            className="resize-none min-h-0 text-sm"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!input.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}