import { api } from "./api";

export const getWorkflows = async () => {
  const response = await api.get("/api/workflows");
  return response.data;
};

export const createReportWorkflow = async (data: any) => {
  const response = await api.post("/api/workflows/report", data);
  return response.data;
};
