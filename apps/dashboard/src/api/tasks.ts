import { api } from "./api";

export const getTasks=async(page=1,limit=5,status="",search="")=>{
const response=await api.get("/api/tasks",{params:{page,limit,status,search}});
return response.data;
};

export const createTask = async (data: any) => {
  const response = await api.post("/api/tasks", data);
  return response.data;
};

export const retryTask=async(taskId:string)=>{
const response=await api.post(`/api/tasks/${taskId}/retry`);
return response.data;
};

export const deleteTask=async(taskId:string)=>{
const response=await api.delete(`/api/tasks/${taskId}`);
return response.data;
};

export const cancelTask=async(taskId:string)=>{
const response=await api.post(`/api/tasks/${taskId}/cancel`);
return response.data;
};

export const getTaskLogs=async(taskId:string)=>{
const response=await api.get(`/api/tasks/${taskId}/logs`);
return response.data;
};