import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)
      ?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:8080`;
    }
  }

  return 'http://localhost:8080';
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
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