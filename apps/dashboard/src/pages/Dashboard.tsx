import { useQueueMetrics } from "../hooks/useQueueMetrics";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "../components/ui/Card";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Server,
  Cpu
} from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";

export default function Dashboard(){
  const metrics = useQueueMetrics();

  if(!metrics){
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Real-time platform metrics and queue status.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const queues = metrics.queues || [];

  const totalJobs = queues.reduce(
    (acc: any, q: any) => acc + q.waiting + q.active + q.completed + q.failed + q.dlq, 0
  );

  const totalCompleted = queues.reduce(
    (acc: any, q: any) => acc + q.completed, 0
  );

  const totalFailed = queues.reduce(
    (acc: any, q: any) => acc + q.failed, 0
  );

  const totalDlq = queues.length > 0 ? queues[0].dlq : 0;

  const successRate = totalJobs > 0 ? ((totalCompleted / totalJobs) * 100).toFixed(1) : "0";
  const failedRate = totalJobs > 0 ? ((totalFailed / totalJobs) * 100).toFixed(1) : "0";

  const chartData = queues.map((q: any) => ({
    name: q.name,
    value: q.waiting + q.active + q.completed + q.failed,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return(
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Real-time platform metrics and queue status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all queues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{totalCompleted.toLocaleString()} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{failedRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{totalFailed.toLocaleString()} failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">DLQ Jobs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{totalDlq.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Queue Metrics</CardTitle>
            <CardDescription>Real-time status of all active queues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queues.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">No active queues found</div>
              ) : (
                queues.map((queue: any) => (
                  <div key={queue.name} className="flex flex-col space-y-3 rounded-lg border p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{queue.name}</span>
                      </div>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground font-medium">
                        {(queue.waiting + queue.active + queue.completed + queue.failed).toLocaleString()} jobs
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-sm text-center mt-2">
                      <div className="flex flex-col bg-background/50 rounded p-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Wait</span>
                        <span className="font-medium text-amber-500">{queue.waiting}</span>
                      </div>
                      <div className="flex flex-col bg-background/50 rounded p-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</span>
                        <span className="font-medium text-blue-500">{queue.active}</span>
                      </div>
                      <div className="flex flex-col bg-background/50 rounded p-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Done</span>
                        <span className="font-medium text-emerald-500">{queue.completed}</span>
                      </div>
                      <div className="flex flex-col bg-background/50 rounded p-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fail</span>
                        <span className="font-medium text-red-500">{queue.failed}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Queue Distribution</CardTitle>
            <CardDescription>Volume of jobs across all queues</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {chartData.length === 0 || totalJobs === 0 ? (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Cpu className="h-8 w-8 opacity-20" />
                No data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {chartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--color-card)", 
                      borderColor: "var(--color-border)",
                      borderRadius: "0.5rem",
                      color: "var(--color-foreground)"
                    }} 
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}