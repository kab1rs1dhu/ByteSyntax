import { axiosInstance } from './axios';

export async function getScreenToken(){
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}

