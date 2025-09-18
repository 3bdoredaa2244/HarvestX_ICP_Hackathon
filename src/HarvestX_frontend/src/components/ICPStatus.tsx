import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { useICPHealth } from "@/hooks/useICP";

export const ICPStatus = () => {
  const { isHealthy, loading } = useICPHealth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-muted-foreground">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {isHealthy ? (
          <Wifi className="h-3 w-3 text-success" />
        ) : (
          <WifiOff className="h-3 w-3 text-destructive" />
        )}
        <Badge 
          variant={isHealthy ? "default" : "destructive"} 
          className={`text-xs ${isHealthy ? "bg-success text-success-foreground" : ""}`}
        >
          ICP {isHealthy ? "Live" : "Offline"}
        </Badge>
      </div>
    </div>
  );
};