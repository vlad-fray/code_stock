import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface IRequestInterceptors {
    onSuccess: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    onError: (err: AxiosError) => unknown;
}

interface IResponseInterceptors {
    onSuccess: (config: AxiosResponse) => AxiosResponse;
    onError: (err: AxiosError) => unknown;
}

const createAxiosInstance = (
    baseURL: string,
    request: IRequestInterceptors,
    response: IResponseInterceptors,
) => {
    const instance = axios.create({
        baseURL,
        withCredentials: true,
    });

    instance.interceptors.request.use(request.onSuccess, request.onError);
    instance.interceptors.response.use(response.onSuccess, response.onError);

    const setHeaders = (header: string, value: string | null) => {
        if (!value) {
            delete instance.defaults.headers.common[header];
            return;
        }

        instance.defaults.headers.common[header] = value;
    };

    return {
        instance,
        setHeaders,
    };
};

export { createAxiosInstance };
