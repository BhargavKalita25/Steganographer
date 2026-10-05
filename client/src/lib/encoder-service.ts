import { IEncodeRequest, IEncodeResponse, IDecodeRequest, IDecodeResponse, IFileData } from "@/types";
import { postAsync, OperationResult } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function uploadFileAsync(file: File, abortController?: AbortController): Promise<OperationResult<IFileData>> {
    const formData = new FormData();
    formData.append("file", file);

    return postAsync<IFileData>(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        abortController
    });
}

export function encodeAsync(data: IEncodeRequest, abortController?: AbortController): Promise<OperationResult<IEncodeResponse>> {
    return postAsync<IEncodeResponse>(`${API_BASE_URL}/encode`, data, { abortController });
}

export function decodeAsync(data: IDecodeRequest, abortController?: AbortController): Promise<OperationResult<IDecodeResponse>> {
    return postAsync<IDecodeResponse>(`${API_BASE_URL}/decode`, data, { abortController });
}
