import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getQueueStatus, pauseQueue, resumeQueue } from "../api/queues";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { PauseCircle, PlayCircle, Settings2, Activity } from "lucide-react";

export default function QueueManagement() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await getQueueStatus();
      setStatus(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await pauseQueue();
      toast.success("Queues paused successfully");
      await loadStatus();
    } catch (error) {
      toast.error("Failed to pause queues");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await resumeQueue();
      toast.success("Queues resumed successfully");
      await loadStatus();
    } catch (error) {
      toast.error("Failed to resume queues");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
        <p className="text-muted-foreground mt-2">Control the global state of the distributed queue.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Global Queue Controls
              </CardTitle>
              <CardDescription className="mt-1">
                Pause or resume processing for all queues. Running jobs will finish, but no new jobs will be picked up when paused.
              </CardDescription>
            </div>
            {!loading && status && (
              <Badge variant={status.isPaused ? "warning" : "success"} className="text-sm px-3 py-1">
                {status.isPaused ? "PAUSED" : "RUNNING"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 p-6 bg-muted/20 border rounded-lg items-center justify-center">
              <Button
                variant={status?.isPaused ? "secondary" : "warning"}
                size="lg"
                disabled={actionLoading || status?.isPaused}
                onClick={handlePause}
                className="w-full sm:w-auto"
              >
                <PauseCircle className="mr-2 h-5 w-5" />
                Pause Processing
              </Button>
              <Button
                variant={!status?.isPaused ? "secondary" : "success"}
                size="lg"
                disabled={actionLoading || !status?.isPaused}
                onClick={handleResume}
                className="w-full sm:w-auto"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Resume Processing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-primary" />
              Queue Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Redis Connection</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-mono">Normal</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Global State</span>
                  <span className="font-semibold">{status?.isPaused ? 'Suspended' : 'Active'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
