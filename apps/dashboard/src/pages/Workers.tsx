import { useEffect, useState } from "react";
import { getWorkers } from "../api/workers";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Activity, CheckCircle2, XCircle, Clock, Server, Layers } from "lucide-react";

export default function Workers() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkers = async () => {
    try {
      const data = await getWorkers();
      setWorkers(data.workers || []);
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
    const interval = setInterval(() => {
      loadWorkers();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
        <p className="text-muted-foreground mt-2">Monitor worker nodes processing tasks in real-time.</p>
      </div>

      {loading && !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{summary.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Offline Workers</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.inactive}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && workers.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))
        ) : workers.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Server className="h-12 w-12" />}
              title="No workers found"
              description="There are currently no active or offline workers."
            />
          </div>
        ) : (
          workers.map((worker) => {
            const uptimeMinutes = Math.floor(
              (Date.now() - new Date(worker.startedAt).getTime()) / (1000 * 60)
            );
            
            // Format uptime
            const days = Math.floor(uptimeMinutes / (24 * 60));
            const hours = Math.floor((uptimeMinutes % (24 * 60)) / 60);
            const minutes = uptimeMinutes % 60;
            const uptimeStr = days > 0 
              ? `${days}d ${hours}h` 
              : hours > 0 
                ? `${hours}h ${minutes}m` 
                : `${minutes}m`;

            return (
              <Card key={worker.workerId} className="hover:shadow-md transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Server className="h-5 w-5 text-primary" />
                        {worker.workerId.split('-')[0]}...
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                        {worker.workerId}
                      </p>
                    </div>
                    <Badge variant={worker.status === "active" ? "success" : "destructive"} className="uppercase">
                      {worker.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1 bg-muted/30 p-3 rounded-lg border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" /> Processed
                        </span>
                        <span className="font-semibold text-lg">{worker.processedCount}</span>
                      </div>
                      <div className="flex flex-col space-y-1 bg-muted/30 p-3 rounded-lg border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Uptime
                        </span>
                        <span className="font-semibold text-lg">{uptimeStr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/10 p-2 rounded border">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span className="truncate">Heartbeat: {new Date(worker.lastHeartbeat).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}