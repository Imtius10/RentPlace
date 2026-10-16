import type { ApiEnvelope } from "@/lib/types";
import {
  ACCESS_TOKEN_KEY,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/session";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://rent-nest-api-seven.vercel.app"
).replace(/\/+$/, "");

/**
 * In the browser every request stays on this origin and is forwarded to the
 * API by the Next rewrite in `next.config.ts`. That keeps the app immune to
 * cross-origin (CORS / CORP) restrictions on the API host.
 * On the server (SSR) there is no origin to share, so we call the API directly.
 */
const BASE = typeof window === "undefined" ? API_URL : "";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  auth?: boolean;
  signal?: AbortSignal;
  /** internal: prevents an infinite refresh loop */
  _retried?: boolean;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    const token = json?.data?.accessToken;
    if (token) {
      saveTokens(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

/** De-duplicates concurrent refresh attempts (single-flight). */
function getRefreshedToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const {
    method = "GET",
    body,
    query,
    auth = true,
    signal,
    _retried = false,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth && typeof window !== "undefined") {
    let token: string | null | undefined = getAccessToken();
    if (!token) {
      token = await getRefreshedToken();
    }
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: "include",
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ApiError(
      "Couldn't reach the RentPlace API. Check your connection or the API_URL used by the /api rewrite in next.config.ts and try again.",
      0,
      error
    );
  }

  // Expired access token -> refresh once, then replay the request.
  if (res.status === 401 && auth && !_retried) {
    const token = await getRefreshedToken();
    if (token) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    // No refresh possible: the session is truly gone -> sign the UI out.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rn:session-expired"));
    }
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    json = null;
  }

  if (!res.ok || !json || json.success === false) {
    const message =
      json?.message ||
      (res.status === 401
        ? "Your session has expired. Please sign in again."
        : res.status === 403
          ? "You do not have permission to do that."
          : res.status === 404
            ? "The requested resource was not found."
            : res.status >= 500
              ? "Something went wrong on our side. Please try again."
              : "Request failed. Please try again.");
    throw new ApiError(message, json?.statusCode ?? res.status, json);
  }

  return json;
}

export const api = {
  get: <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export { ACCESS_TOKEN_KEY };
