import axiosInstance from "./axiosInstance";

export const getProjectsApi = (params: {
  search: string;
  page: number;
  limit: number;
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