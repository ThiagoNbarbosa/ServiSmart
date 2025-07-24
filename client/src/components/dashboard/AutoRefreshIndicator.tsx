import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface AutoRefreshIndicatorProps {
  interval: number; // in seconds
  onRefresh: () => void;
}

export default function AutoRefreshIndicator({ interval, onRefresh }: AutoRefreshIndicatorProps) {
  const [countdown, setCountdown] = useState(interval);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCountdown(interval);
  }, [interval]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, onRefresh, isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="auto-refresh-indicator">
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-3 flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${isPaused ? 'bg-gray-500' : 'bg-green-500 animate-pulse-slow'}`} />
          <span className="text-xs text-gray-600">
            {isPaused ? 'Pausado' : `Auto-refresh em ${countdown}s`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            className="h-6 w-6 p-0"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
