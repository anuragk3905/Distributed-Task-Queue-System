import { api } from "./api";

export const getQueueMetrics =
async () => {
const response = await api.get(
"/api/queues/metrics"
);

return response.data;
};