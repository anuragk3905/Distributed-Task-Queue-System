
import { Circle, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "./ui/Card";

type Log = {
  _id: string;
  event: string;
  message: string;
  progress?: number;
  createdAt: string;
};

type Props = {
  logs: Log[];
};

export default function TaskTimeline({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No logs found for this task.
      </div>
    );
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "failed": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "dead": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default: return <Circle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {logs.map((log) => (
        <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
            {getEventIcon(log.event)}
          </div>
          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-sm border-border bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="font-semibold capitalize tracking-tight">{log.event}</span>
              <time className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="text-sm text-muted-foreground break-words">{log.message}</p>
            {log.progress !== undefined && (
              <p className="text-xs font-medium text-primary mt-2">
                Progress: {log.progress}%
              </p>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}