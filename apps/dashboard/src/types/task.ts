export type TaskStatus =
| "queued"
| "active"
| "completed"
| "failed"
| "dead";

export interface Task {
_id: string;
taskId: string;
jobId: string;
queue: string;
type: string;
status: TaskStatus;
progress: number;
priority: number;
attempts: number;
maxAttempts: number;
payload?: any;
result?: any;
error?: string;
createdAt: string;
completedAt?: string;
}