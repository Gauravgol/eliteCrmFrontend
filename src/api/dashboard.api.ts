import axiosInstance from "./axiosInstance";

export const getUserInfoApi = (userId: string) => {
    return axiosInstance.get(`/getUserInfo`, {
        params: { userId },
    });
};

export const getDashboardDataApi = (userId: string) => {
    return axiosInstance.get(`/getDashboardData`, {
        params: { userId },
        headers: {
            urn: Date.now().toString(),
        },
    });
};
