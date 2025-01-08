type RequestInfo = string | URL | globalThis.Request;

export function createMockFetch<T>(
  response: T,
  spiesOn: (input: RequestInfo, init?: RequestInit) => void,
  options?: { ok?: boolean; status?: number; statusText?: string }
): (input: RequestInfo, init?: RequestInit) => Promise<Response> {
  return function (input: RequestInfo, init?: RequestInit): Promise<Response> {
    spiesOn(input, init);
    return Promise.resolve({
      ok: options?.ok ?? true,
      status: options?.status ?? 200,
      statusText: options?.statusText ?? "OK",
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response);
  };
}
