import { useEffect, useState, useCallback } from "react";
import { getTasks, retryTask, deleteTask, getTaskLogs } from "../api/tasks";
import JobCard from "../components/JobCard";
import type { Task } from "../types/task";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import TaskTimeline from "../components/TaskTimeline";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Search, Filter, ListTodo, ChevronLeft, ChevronRight } from "lucide-react";

export default function Jobs() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadTasks = useCallback(async (status = "", searchQuery = "") => {
    try {
      const data = await getTasks(page, limit, status, searchQuery);
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadTasks(statusFilter, search);
  }, [statusFilter, search, loadTasks]);

  useSocket("job-progress", (data) => {
    if (data.status === "completed") {
      toast.success(`Job ${data.jobId} completed`);
    }
    if (data.status === "failed") {
      toast.error(`Job ${data.jobId} failed`);
    }
    if (data.status === "dead") {
      toast.error(`Job ${data.jobId} moved to DLQ`);
    }
    setTasks((prev) =>
      prev.map((task) =>
        task.jobId === data.jobId
          ? {
              ...task,
              status: data.status,
              progress: data.progress,
              result: data.result,
              error: data.error,
            }
          : task
      )
    );
  });

  const handleRetry = async (taskId: string) => {
    try {
      await retryTask(taskId);
      loadTasks(statusFilter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadTasks(statusFilter);
    } catch (error) {
      console.error(error);
    }
  };

  const loadLogs = async (taskId: string) => {
    try {
      setLogsLoading(true);
      const data = await getTaskLogs(taskId);
      setLogs(data.logs || []);
      setSelectedTask(taskId);
    } catch (error) {
      console.log(error);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all task executions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[200px] lg:w-[250px]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="dead">Dead</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-12 w-12" />}
            title="No jobs found"
            description="There are currently no jobs matching your criteria."
          />
        ) : (
          tasks.map((task) => (
            <JobCard
              key={task.taskId}
              task={task}
              onRetry={handleRetry}
              onDelete={handleDelete}
              onViewLogs={loadLogs}
            />
          ))
        )}
      </div>
      
      {!loading && tasks.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-medium">{total}</span> jobs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setLogs([]);
        }}
        title="Task Timeline & Logs"
        className="max-w-3xl"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {logsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <TaskTimeline logs={logs} />
          )}
        </div>
      </Modal>
    </div>
  );
}