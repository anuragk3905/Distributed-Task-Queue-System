import type { Task } from "../types/task";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ProgressBar } from "./ui/ProgressBar";
import { Clock, RefreshCw, Trash2, Eye, AlertCircle } from "lucide-react";

interface Props {
  task: Task;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewLogs?: (id: string) => void;
}

export default function JobCard({ task, onRetry, onDelete, onViewLogs }: Props) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "failed": return "destructive";
      case "dead": return "warning";
      case "active": return "default";
      default: return "secondary";
    }
  };

  const getProgressClassName = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "failed": return "bg-destructive";
      case "dead": return "bg-amber-500";
      default: return "bg-primary";
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between bg-muted/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-none tracking-tight">{task.queue}</h3>
            <Badge variant={getStatusVariant(task.status)} className="capitalize">
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Clock className="h-3 w-3" />
            <span>Job ID: <span className="font-mono">{task.jobId || "N/A"}</span></span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{task.progress}%</div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <ProgressBar 
            value={task.progress} 
            indicatorClassName={getProgressClassName(task.status)} 
          />
          
          {task.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="break-words">{task.error}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onViewLogs?.(task._id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Timeline
        </Button>
        
        {task.status === "dead" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRetry?.(task._id)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Replay
          </Button>
        )}
        
        <Button 
          variant="destructive" 
          size="sm"
          className="ml-auto"
          onClick={() => onDelete?.(task._id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}