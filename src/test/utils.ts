import { type Response, Request, RequestInit } from "undici";

type RequestInfo = string | URL | Request;

export function createMockFetch<T>(
  response: T,
  spiesOn: (input: RequestInfo, init?: RequestInit) => void,
  options?: { ok?: boolean; status?: number; statusText?: string }
): (input: RequestInfo, init?: RequestInit) => Promise<Response> {
  return function (input: RequestInfo, init?: RequestInit): Promise<Response> {
    spiesOn(input, init);
    if (options?.status && options.status >= 500) {
      return Promise.reject(
        new TypeError(options?.statusText ?? "Internal Server Error")
      );
    }
    return Promise.resolve({
      ok: options?.ok ?? true,
      status: options?.status ?? 200,
      statusText: options?.statusText ?? "OK",
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response);
  };
}
