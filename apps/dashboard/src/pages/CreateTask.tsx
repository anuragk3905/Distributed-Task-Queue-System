import React, { useState } from "react";
import toast from "react-hot-toast";
import { Send, Clock, Repeat, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { createTask } from "../api/tasks";

export default function CreateTask() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    queue: "email-tasks",
    email: "",
    subject: "",
    imageUrl: "",
    filterType: "grayscale",
    userId: "",
    message: "",
    reportType: "monthly",
    reportEmail: "",
    priority: "normal",
    delay: "",
    cron: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let data: any = {};
      let type = "unknown";

      if (formData.queue === "email-tasks") {
        type = "send-email";
        data = { to: formData.email, subject: formData.subject };
      } else if (formData.queue === "image-tasks") {
        type = "process-image";
        data = { imageUrl: formData.imageUrl, filterType: formData.filterType };
      } else if (formData.queue === "notification-tasks") {
        type = "send-notification";
        data = { userId: formData.userId, message: formData.message };
      } else if (formData.queue === "report-tasks") {
        type = "generate-report";
        data = { reportType: formData.reportType, email: formData.reportEmail };
      }

      const payload: any = {
        type,
        queue: formData.queue,
        data,
        opts: {
          priority: formData.priority === "high" ? 1 : formData.priority === "low" ? 3 : 2,
        }
      };

      if (formData.delay) {
        payload.opts.delay = parseInt(formData.delay, 10);
      }
      
      if (formData.cron) {
        payload.opts.repeat = { pattern: formData.cron };
      }

      await createTask(payload);
      toast.success("Task created successfully!");
      setFormData({
        queue: formData.queue,
        email: "",
        subject: "",
        imageUrl: "",
        filterType: "grayscale",
        userId: "",
        message: "",
        reportType: "monthly",
        reportEmail: "",
        priority: "normal",
        delay: "",
        cron: "",
      });
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in-50 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Task</h1>
        <p className="text-muted-foreground mt-2">Schedule a new job to be processed by the workers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Configure the task parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="queue" className="text-sm font-medium leading-none">Target Queue</label>
                <Select id="queue" name="queue" value={formData.queue} onChange={handleChange}>
                  <option value="email-tasks">Email Tasks</option>
                  <option value="image-tasks">Image Processing</option>
                  <option value="notification-tasks">Push Notifications</option>
                  <option value="report-tasks">Report Generation</option>
                </Select>
              </div>

              {formData.queue === "email-tasks" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">Recipient Email</label>
                    <Input id="email" name="email" type="email" placeholder="user@example.com" required value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium leading-none">Subject Line</label>
                    <Input id="subject" name="subject" type="text" placeholder="Welcome to our platform!" required value={formData.subject} onChange={handleChange} />
                  </div>
                </>
              )}

              {formData.queue === "image-tasks" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="text-sm font-medium leading-none">Image URL</label>
                    <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/image.jpg" required value={formData.imageUrl} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="filterType" className="text-sm font-medium leading-none">Filter Type</label>
                    <Select id="filterType" name="filterType" value={formData.filterType} onChange={handleChange}>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="blur">Blur</option>
                    </Select>
                  </div>
                </>
              )}

              {formData.queue === "notification-tasks" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="userId" className="text-sm font-medium leading-none">User ID</label>
                    <Input id="userId" name="userId" type="text" placeholder="usr_123456" required value={formData.userId} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium leading-none">Message Payload</label>
                    <Input id="message" name="message" type="text" placeholder="You have a new notification!" required value={formData.message} onChange={handleChange} />
                  </div>
                </>
              )}

              {formData.queue === "report-tasks" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="reportType" className="text-sm font-medium leading-none">Report Type</label>
                    <Select id="reportType" name="reportType" value={formData.reportType} onChange={handleChange}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reportEmail" className="text-sm font-medium leading-none">Delivery Email</label>
                    <Input id="reportEmail" name="reportEmail" type="email" placeholder="admin@example.com" required value={formData.reportEmail} onChange={handleChange} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium leading-none">Priority</label>
                <Select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="delay" className="text-sm font-medium leading-none flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Delay (ms)
                  </label>
                  <Input id="delay" name="delay" type="number" min="0" placeholder="e.g. 5000 for 5s delay" value={formData.delay} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cron" className="text-sm font-medium leading-none flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    Recurring (Cron)
                  </label>
                  <Input id="cron" name="cron" type="text" placeholder="* * * * *" value={formData.cron} onChange={handleChange} />
                  <p className="text-[0.8rem] text-muted-foreground">Leave empty for one-time job</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Task
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
