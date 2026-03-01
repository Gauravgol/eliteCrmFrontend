import axiosInstance from "./axiosInstance";

export const loginApi = (payload: any, urn: string) => {
    return axiosInstance.post("/login", payload, {
        headers: {
            "Content-Type": "application/json",
            urn,
        },
    });
};
