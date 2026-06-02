import { useEffect, useState } from "react";
import { getHealth, getHealthLive, getHealthReady } from "../api/health";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { HeartPulse, Database, Server, Activity, ShieldCheck, ShieldAlert } from "lucide-react";

export default function Health() {
  const [healthData, setHealthData] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [readyData, setReadyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const [h, l, r] = await Promise.all([
        getHealth().catch((e) => ({ status: `DOWN (${e.message || "Unknown error"})` })),
        getHealthLive().catch((e) => ({ status: `DOWN (${e.message || "Unknown error"})` })),
        getHealthReady().catch((e) => ({ status: `DOWN (${e.message || "Unknown error"})` }))
      ]);
      setHealthData(h);
      setLiveData(l);
      setReadyData(r);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "ok" || s === "up" || s === "healthy" || s === "ready") {
      return <Badge variant="success" className="uppercase">{status}</Badge>;
    }
    return <Badge variant="destructive" className="uppercase">{status || "down"}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "ok" || s === "up" || s === "healthy" || s === "ready") {
      return <ShieldCheck className="h-6 w-6 text-emerald-500" />;
    }
    return <ShieldAlert className="h-6 w-6 text-destructive" />;
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return "N/A";
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor((seconds % (3600*24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Health</h1>
        <p className="text-muted-foreground mt-2">Real-time monitoring of all critical infrastructure components.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData?.status)}
                <span className="text-2xl font-bold capitalize">{healthData?.status || "Unknown"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Liveness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-center gap-2">
                {getStatusIcon(liveData?.status)}
                <span className="text-2xl font-bold capitalize">{liveData?.status || "Unknown"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-center gap-2">
                {getStatusIcon(readyData?.status)}
                <span className="text-2xl font-bold capitalize">{readyData?.status || "Unknown"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Dependencies
            </CardTitle>
            <CardDescription>Status of external services and databases</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">MongoDB</p>
                      <p className="text-sm text-muted-foreground">Main datastore</p>
                    </div>
                  </div>
                  {getStatusBadge(healthData?.dependencies?.mongodb?.status || healthData?.status || "ok")}
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Redis</p>
                      <p className="text-sm text-muted-foreground">Message broker / Queue</p>
                    </div>
                  </div>
                  {getStatusBadge(healthData?.dependencies?.redis?.status || healthData?.status || "ok")}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Information
            </CardTitle>
            <CardDescription>Server process details</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">{healthData?.version || "1.0.0"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-mono">{formatUptime(healthData?.uptime)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-mono uppercase">{healthData?.environment || "production"}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-muted-foreground">Last Checked</span>
                  <span className="font-mono">{healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : "N/A"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
