import axiosInstance from "./axiosInstance";

export const markNotificationsAsRead = async (notificationIds: string[], userId: string) => {
    return axiosInstance.post("/markNotification", {
        notificationIds,
        userId,
    });
};

export const getNotifications = async (userId: string, page: number, limit: number = 5) => {
    return axiosInstance.get(`/getNotification?userId=${userId}&page=${page}&limit=${limit}`);
};
