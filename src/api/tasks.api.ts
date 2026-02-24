import axiosInstance from "./axiosInstance";

export const getTasksApi = (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    assignedTo?: string;
    projectId?: string;
}) => {
    return axiosInstance.get("/getTask", { params });
};
