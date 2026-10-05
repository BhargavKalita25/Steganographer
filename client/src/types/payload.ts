export interface IFileData {
    id: string;
}

export interface ISecret {
    key: string;
}

export interface IAlgorithmConfig {
    bits_per_pixel: number;
    secret?: ISecret;
}

export interface IEncodeRequest {
    image_id: string;
    message: string;
    config: IAlgorithmConfig;
}

export interface IDecodeRequest {
    image_id: string;
    config: IAlgorithmConfig;
}

export interface IEncodeResponse {
    id: string;
    changes: number;
}

export interface IDecodeResponse {
    message: string;
}
