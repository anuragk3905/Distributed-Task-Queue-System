import { useEffect, useState, useCallback } from "react";
import { getTasks, retryTask, deleteTask } from "../api/tasks";
import JobCard from "../components/JobCard";
import type { Task } from "../types/task";
import { useSocket } from "../hooks/useSocket";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";

function DLQ() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeadTasks = useCallback(async () => {
    try {
      const data = await getTasks(1, 50, "dead");
      setTasks(data.tasks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeadTasks();
  }, [loadDeadTasks]);

  useSocket("job-progress", useCallback((data: any) => {
    if (data.status === "dead") {
      setTimeout(() => {
        loadDeadTasks();
      }, 1000);
    } else {
      setTasks((prev) => prev.filter((task) => task.jobId !== data.jobId));
    }
  }, [loadDeadTasks]));

  const handleRetry = async (taskId: string) => {
    try {
      await retryTask(taskId);
      loadDeadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadDeadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRetryAll = async () => {
    // In a real app we'd have a bulk retry endpoint.
    // For now we'll retry them one by one if they request it.
    for (const task of tasks) {
      try {
        await retryTask(task._id);
      } catch (error) {
        console.error(error);
      }
    }
    loadDeadTasks();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-500 flex items-center gap-2">
            <AlertOctagon className="h-8 w-8" />
            Dead Letter Queue
          </h1>
          <p className="text-muted-foreground mt-2">Manage jobs that have failed all retry attempts.</p>
        </div>
        {tasks.length > 0 && (
          <Button variant="outline" onClick={handleRetryAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<AlertOctagon className="h-12 w-12 text-muted-foreground/50" />}
            title="DLQ is empty"
            description="Great job! There are no dead tasks requiring your attention."
          />
        ) : (
          tasks.map((task) => (
            <JobCard
              key={task._id}
              task={task}
              onRetry={handleRetry}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default DLQ;