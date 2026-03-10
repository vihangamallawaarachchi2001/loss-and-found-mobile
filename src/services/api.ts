import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000', // ASP.NET Gateway
  timeout: 5000,
});

type NativeEnv = 'ui' | 'dev' | 'prod' | 'unknown';

const nativeEnvValue = (
  process.env.EXPO_PUBLIC_NATIVE_ENV ?? process.env.NATIVE_ENV ?? ''
).toLowerCase();

export const NATIVE_ENV: NativeEnv =
  nativeEnvValue === 'ui' || nativeEnvValue === 'dev' || nativeEnvValue === 'prod'
    ? nativeEnvValue
    : 'unknown';

export const shouldCallRealApi = NATIVE_ENV === 'dev' || NATIVE_ENV === 'prod';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function postWithFeatureFlag<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  if (shouldCallRealApi) {
    return api.post<T>(url, data, config);
  }

  await sleep(450);

  return {
    data: { mocked: true } as T,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: (config ?? {}) as AxiosRequestConfig,
  } as AxiosResponse<T>;
}