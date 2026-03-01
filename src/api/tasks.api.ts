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

export const createTaskApi = (formData: any) => {
    return axiosInstance.post("/createTask", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const updateTaskApi = (payload: any, isFormData = false) => {
    return axiosInstance.put("/updateTask", payload, {
        headers: isFormData ? { urn: "1234567890123" } : { "Content-Type": "application/json", urn: "1234567890123" }
    });
};
