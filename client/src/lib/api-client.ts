import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export interface OperationResult<T> {
    isSuccessful: boolean;
    data?: T;
    errorMessage?: string;
}

const instance = axios.create({
    headers: {
        Accept: "application/json"
    }
});

export async function postAsync<TResponse>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { abortController?: AbortController }
): Promise<OperationResult<TResponse>> {
    const axiosConfig: AxiosRequestConfig = {
        ...config,
        signal: config?.abortController?.signal
    };

    try {
        const response: AxiosResponse<TResponse> = await instance.post(url, data, axiosConfig);
        return {
            isSuccessful: true,
            data: response.data
        };
    } catch (error) {
        let message = "An unexpected error occurred.";
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.message) {
                message = error.message;
            }
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            isSuccessful: false,
            errorMessage: message
        };
    }
}

export function buildFileUrl(fileId?: string): string {
    if (!fileId) return "";
    const base = process.env.NEXT_PUBLIC_API_URL || "/api";
    return `${base}/file/${encodeURIComponent(fileId)}`;
}
