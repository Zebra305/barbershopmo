import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { Clock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QueueStatus {
  count: number;
  estimatedWait: string;
  lastUpdate: string;
}

interface WebSocketMessage {
  type: string;
  count?: number;
  estimatedWait?: string;
}

export default function QueueStatus() {
  const { t } = useTranslation();
  const [queueData, setQueueData] = useState<QueueStatus | null>(null);
  const { message: wsMessage } = useWebSocket();

  const { data: initialQueueData } = useQuery<QueueStatus>({
    queryKey: ["/api/queue/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update queue data from WebSocket
  useEffect(() => {
    if (wsMessage) {
      const message = wsMessage as WebSocketMessage;
      if (message.type === "queue_update") {
        setQueueData({
          count: message.count || 0,
          estimatedWait: message.estimatedWait || "No wait",
          lastUpdate: new Date().toISOString(),
        });
      }
    }
  }, [wsMessage]);

  // Use initial data if no WebSocket updates
  useEffect(() => {
    if (initialQueueData && !queueData) {
      setQueueData(initialQueueData);
    }
  }, [initialQueueData, queueData]);

  const currentData = queueData || initialQueueData;

  const trafficPredictions = [
    {
      time: t("queue.traffic.now"),
      status: t("queue.traffic.low"),
      color: "traffic-low",
    },
    {
      time: t("queue.traffic.afternoon"),
      status: t("queue.traffic.moderate"),
      color: "traffic-moderate",
    },
    {
      time: t("queue.traffic.evening"),
      status: t("queue.traffic.high"),
      color: "traffic-high",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Current Queue Status */}
      <Card className="bg-barber-light">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-barber-dark mb-4">
              {t("queue.currentlyWaiting")}
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="queue-status-circle">
                <span className="text-3xl font-bold">
                  {currentData?.count || 0}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              {t("queue.estimatedWait")}: {currentData?.estimatedWait || "No wait"}
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {t("queue.lastUpdated")}: {
                  currentData?.lastUpdate 
                    ? new Date(currentData.lastUpdate).toLocaleTimeString()
                    : "-"
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Prediction */}
      <Card className="bg-barber-light">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-barber-dark mb-4">
            {t("queue.bestTime")}
          </h3>
          <div className="space-y-3">
            {trafficPredictions.map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`traffic-indicator ${prediction.color}`}></div>
                  <span className="font-medium">{prediction.time}</span>
                </div>
                <span className="text-sm text-gray-600">{prediction.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Info className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700">
                {t("queue.tip")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
