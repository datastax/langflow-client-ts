// Copyright DataStax, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { type Response, Request, RequestInit } from "undici";

type RequestInfo = string | URL | Request;

export function createMockFetch<T>(
  response: T,
  spiesOn: (input: RequestInfo, init?: RequestInit) => void,
  options?: {
    ok?: boolean;
    status?: number;
    statusText?: string;
    body?: ReadableStream;
  }
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
      body: options?.body,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response);
  };
}
