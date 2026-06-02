import { api } from "./api";

export const getQueueMetrics=async()=>{
const response=await api.get(
"/api/queues/metrics"
);
return response.data;
};

export const getQueueStatus=async()=>{
const response=await api.get(
"/api/queues/status"
);
return response.data;
};

export const pauseQueue=async()=>{
const response=await api.post(
"/api/queues/pause"
);
return response.data;
};

export const resumeQueue=async()=>{
const response=await api.post(
"/api/queues/resume"
);
return response.data;
};