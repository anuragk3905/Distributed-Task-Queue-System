import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import { Play, GitMerge, FileText, FileDown, Mail, ArrowDown, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getWorkflows, createReportWorkflow } from "../api/workflows";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const loadWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error("Failed to load workflows, it may not be implemented in the backend yet", error);
      // Fallback for visual demo purposes if backend doesn't support the route yet
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };
  useSocket("job-progress", () => {
    // Refresh workflows when there is progress so the UI updates
    loadWorkflows();
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleTriggerReport = async () => {
    setTriggering(true);
    try {
      await createReportWorkflow({ 
        reportType: "monthly",
        email: "admin@taskflow.local"
      });
      toast.success("Report workflow triggered successfully!");
      loadWorkflows();
    } catch (error) {
      toast.error("Failed to trigger workflow");
      console.error(error);
    } finally {
      setTriggering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10";
      case "failed": return "text-destructive border-destructive/50 bg-destructive/10";
      case "active": return "text-primary border-primary/50 bg-primary/10";
      case "waiting": return "text-amber-500 border-amber-500/50 bg-amber-500/10";
      default: return "text-muted-foreground border-border bg-muted/50";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-2">Manage and trigger complex BullMQ Flows (job dependency trees).</p>
        </div>
        <Button onClick={handleTriggerReport} disabled={triggering} size="lg" className="shrink-0">
          {triggering ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
          Trigger Report Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-primary" />
              Report Generation Flow
            </CardTitle>
            <CardDescription>Visual dependency tree of the workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-6">
              
              <div className="w-full max-w-[200px] border border-border rounded-lg p-3 text-center bg-card shadow-sm z-10 relative">
                <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-sm font-semibold">1. Generate Data</p>
                <p className="text-xs text-muted-foreground mt-1">Aggregates metrics</p>
              </div>

              <div className="h-8 w-px bg-border flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground bg-background rounded-full" />
              </div>

              <div className="w-full max-w-[200px] border border-border rounded-lg p-3 text-center bg-card shadow-sm z-10 relative">
                <FileDown className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-semibold">2. Generate PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Creates document</p>
              </div>

              <div className="h-8 w-px bg-border flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground bg-background rounded-full" />
              </div>

              <div className="w-full max-w-[200px] border border-border rounded-lg p-3 text-center bg-card shadow-sm z-10 relative">
                <Mail className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold">3. Send Email</p>
                <p className="text-xs text-muted-foreground mt-1">Delivers report</p>
              </div>
              
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Workflow Executions</CardTitle>
            <CardDescription>Status of triggered workflow chains</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : workflows.length === 0 ? (
              <EmptyState
                icon={<GitMerge className="h-12 w-12 text-muted-foreground/50" />}
                title="No workflows executed yet"
                description="Trigger a flow using the button above to see it here."
                className="py-12"
              />
            ) : (
              <div className="space-y-4">
                {workflows.map((flow: any) => (
                  <div key={flow.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 bg-muted/10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{flow.name}</span>
                        <Badge variant="outline" className="font-mono text-xs">ID: {flow.id}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {flow.children?.map((child: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(child.status)}`}>
                              {child.name}
                            </div>
                            {i < flow.children.length - 1 && <ArrowDown className="h-3 w-3 -rotate-90 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center sm:items-start flex-row sm:flex-col justify-between">
                      <Badge variant={flow.status === 'completed' ? 'success' : flow.status === 'failed' ? 'destructive' : 'default'} className="uppercase">
                        {flow.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(flow.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
