import { api } from "./api";

export const getWorkers =
async () => {
const response = await api.get(
"/api/workers"
);

return response.data;
};