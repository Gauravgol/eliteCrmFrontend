import axiosInstance from "./axiosInstance";

export const getProjectsApi = (params: {
  search?: string;
  page?: number;
  limit?: number;
  owner?: string;
  status?: string;
  projectId?: string;
}): Promise<ProjectsApiResponse> => {
  return axiosInstance.get("/getProjects", { params });
};

export const updateProjectApi = (payload: any, isFormData = false) => {
  return axiosInstance.put("/updateProject", payload, {
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });
};

export const tagUserApi = (search: string) => {
  return axiosInstance.get("/tagUser", {
    params: { search },
  });
};

export const tagClientApi = (search: string) => {
  return axiosInstance.get("/tagClient", {
    params: { search },
  });
};

export const createProjectApi = (formData: FormData) => {
  return axiosInstance.post("/createProject", formData);
};

export interface ProjectsApiResponse {
  list: any[];
  pagination: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
  };
}