import axiosInstance from "./axiosInstance";

export const getChatUsersApi = (userId: string, search: string) => {
    return axiosInstance.get(`/getChatUsers`, {
        params: { userId, search },
    });
};

export const getChatMessagesApi = (
    userId: string,
    otherUserId: string,
    limit: number,
    before?: string
) => {
    return axiosInstance.get(`/getChatMessages`, {
        params: {
            userId,
            otherUserId,
            limit,
            before,
        },
    });
};
