import axiosInstance from "./axiosInstance";

export const getProjectsApi = (params: {
  search: string;
  page: number;
  limit: number;
  owner?: string;
  status?: string;
}):
  Promise<ProjectsApiResponse> => {
  return axiosInstance.get("/getProjects", { params });
};

export interface ProjectsApiResponse {
  list: any[];
  pagination: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
  };
}