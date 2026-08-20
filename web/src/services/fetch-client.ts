import { env } from "@/config/env";
import { useSessionStore } from "@/store/session.store";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * The single place that knows how to talk to the backend. Every request
 * carries the user's email so the backend can scope data to them — this
 * app's whole notion of "who's asking" (see store/session.store.ts).
 */
export async function client<T>(
  endpoint: string,
  { params, ...customConfig }: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(customConfig.headers as Record<string, string>),
  };

  if (!(customConfig.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const email = useSessionStore.getState().email;
  if (email) {
    headers["x-user-email"] = email;
  }

  const config: RequestInit = {
    method: customConfig.method ?? "GET",
    ...customConfig,
    headers,
  };

  let url = `${env.NEXT_PUBLIC_API_URL}${endpoint}`;

  if (params) {
    const cleanParams = Object.entries(params)
      .filter(([, value]) => value != null)
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };

    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : (errorData.message ?? `Request failed with status ${response.status}`);

    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
