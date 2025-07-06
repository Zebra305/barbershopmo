import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Minus, 
  Send, 
  LogOut, 
  BarChart3, 
  Users, 
  MessageSquare,
  Home
} from "lucide-react";

interface QueueStatus {
  count: number;
  estimatedWait: string;
  lastUpdate: string;
}

interface AiChatMessage {
  id: number;
  message: string;
  isFromUser: boolean;
  timestamp: string;
}

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const [aiChatInput, setAiChatInput] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const queryClient = useQueryClient();

  // WebSocket connection
  const { sendMessage, isConnected } = useWebSocket();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch queue status
  const { data: queueStatus } = useQuery<QueueStatus>({
    queryKey: ["/api/queue/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch AI chat history
  const { data: aiChatHistory } = useQuery<AiChatMessage[]>({
    queryKey: ["/api/ai-chat/history"],
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Queue management mutations
  const addQueueMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/queue/add", {
        serviceType: "walk-in",
        estimatedDuration: 30,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue/status"] });
      toast({
        title: "Success",
        description: "Added customer to queue",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add customer to queue",
        variant: "destructive",
      });
    },
  });

  const completeQueueMutation = useMutation({
    mutationFn: async () => {
      // This would need to be implemented to complete the oldest queue entry
      // For now, we'll simulate by just updating the count
      await apiRequest("POST", "/api/queue/complete/1", {
        actualDuration: 30,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue/status"] });
      toast({
        title: "Success",
        description: "Customer service completed",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete customer service",
        variant: "destructive",
      });
    },
  });

  // AI chat mutation
  const sendAiMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      await apiRequest("POST", "/api/ai-chat/message", {
        message,
        isFromUser: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-chat/history"] });
      setAiChatInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket authentication
  useEffect(() => {
    if (isConnected && user?.id) {
      sendMessage({
        type: "auth",
        userId: user.id,
      });
    }
  }, [isConnected, user?.id, sendMessage]);

  // Update queue count from WebSocket or API
  useEffect(() => {
    if (queueStatus) {
      setQueueCount(queueStatus.count);
    }
  }, [queueStatus]);

  const handleSendAiMessage = () => {
    if (aiChatInput.trim()) {
      sendAiMessageMutation.mutate(aiChatInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAiMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-barber-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-barber-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-barber-dark">
                {t("admin.title")}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? t("admin.connected") : t("admin.disconnected")}
                </span>
              </div>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("admin.home")}
              </Button>
              <Button
                onClick={() => (window.location.href = "/api/logout")}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("auth.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Queue Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {t("admin.queueManagement")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="queue-status-circle text-4xl font-bold mb-2">
                  {queueCount}
                </div>
                <p className="text-gray-600 mb-4">
                  {queueStatus?.estimatedWait || t("admin.noWait")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("admin.lastUpdate")}: {queueStatus?.lastUpdate ? new Date(queueStatus.lastUpdate).toLocaleTimeString() : "-"}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => completeQueueMutation.mutate()}
                  disabled={completeQueueMutation.isPending || queueCount === 0}
                  variant="outline"
                  size="lg"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  {t("admin.complete")}
                </Button>
                <Button
                  onClick={() => addQueueMutation.mutate()}
                  disabled={addQueueMutation.isPending}
                  size="lg"
                  className="bg-barber-gold hover:bg-yellow-600 text-barber-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("admin.addCustomer")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {t("admin.analytics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-barber-light rounded-lg">
                  <span className="font-medium">{t("admin.todayCustomers")}</span>
                  <span className="text-barber-gold font-bold">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-barber-light rounded-lg">
                  <span className="font-medium">{t("admin.avgWaitTime")}</span>
                  <span className="text-barber-gold font-bold">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-barber-light rounded-lg">
                  <span className="font-medium">{t("admin.peakHours")}</span>
                  <span className="text-barber-gold font-bold">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-barber-light rounded-lg">
                  <span className="font-medium">{t("admin.efficiency")}</span>
                  <span className="text-barber-gold font-bold">-</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t("admin.aiAssistant")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-96">
                <ScrollArea className="flex-1 mb-4 p-4 bg-barber-light rounded-lg">
                  <div className="space-y-4">
                    {aiChatHistory?.length === 0 ? (
                      <p className="text-gray-500 text-center">
                        {t("admin.aiReady")}
                      </p>
                    ) : (
                      aiChatHistory?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.isFromUser
                                ? "bg-barber-gold text-barber-dark"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            {message.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Textarea
                    placeholder={t("admin.aiPlaceholder")}
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendAiMessage}
                    disabled={sendAiMessageMutation.isPending || !aiChatInput.trim()}
                    className="bg-barber-gold hover:bg-yellow-600 text-barber-dark"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
