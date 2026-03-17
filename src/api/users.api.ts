import axiosInstance from "./axiosInstance";
import { generateUrn } from "../utils/generateUrn";

export const getUsersApi = (params: any) => {
    return axiosInstance.get(`/getUsers`, {
        headers: {
            urn: generateUrn(),
        },
        params,
    });
};

export const registerUserApi = (formData: FormData) => {
    return axiosInstance.post(`/registerUser`, formData, {
        headers: {
            urn: generateUrn(),
        },
    });
};

export const changePasswordApi = (data: { userId: string; password: string }) => {
  return axiosInstance.post(`/updatePassword`, data, {
    headers: {
      "urn": generateUrn(),
      "Content-Type": "application/json",
    },
  });
};