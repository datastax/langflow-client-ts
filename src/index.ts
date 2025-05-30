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

import { fetch } from "undici";

import pkg from "../package.json" with { type: "json" };
import { LangflowError, LangflowRequestError } from "./errors.js";
import { Flow } from "./flow.js";
import { Logs } from "./logs.js";
import type { LangflowClientOptions, RequestOptions, Tweaks } from "./types.js";
import { DATASTAX_LANGFLOW_BASE_URL } from "./consts.js";

import { platform, arch } from "os";
import { NDJSONStream } from "./ndjson.js";

export class LangflowClient {
  baseUrl: string;
  basePath: string;
  langflowId?: string;
  apiKey?: string;
  fetch: typeof fetch;
  defaultHeaders: Headers;
  logs: Logs;

  constructor(opts: LangflowClientOptions) {
    this.baseUrl = opts.baseUrl ?? DATASTAX_LANGFLOW_BASE_URL;
    this.basePath = "/api";
    this.langflowId = opts.langflowId;
    this.apiKey = opts.apiKey;
    this.fetch = opts.fetch ?? fetch;
    this.defaultHeaders = opts.defaultHeaders ?? new Headers();
    if (!this.defaultHeaders.has("User-Agent")) {
      this.defaultHeaders.set("User-Agent", this.#getUserAgent());
    }

    if (this.#isDataStax()) {
      const errors: string[] = [];
      if (!this.langflowId) {
        errors.push("langflowId is required");
      }
      if (!this.apiKey) {
        errors.push("apiKey is required");
      }
      if (errors.length > 0) {
        throw new TypeError(errors.join(", "));
      }
      this.basePath = `/lf/${this.langflowId}/api`;
    }
    if (!this.#isDataStax() && this.langflowId) {
      throw new TypeError("langflowId is not supported");
    }
    this.logs = new Logs(this);
  }

  #isDataStax(): boolean {
    return this.baseUrl === DATASTAX_LANGFLOW_BASE_URL;
  }

  #getUserAgent(): string {
    return `@datastax/langflow-client/${pkg.version} (${platform()} ${arch()}) node/${process.version}`;
  }

  #setApiKey(apiKey: string, headers: Headers) {
    if (this.#isDataStax()) {
      headers.set("Authorization", `Bearer ${apiKey}`);
    } else {
      headers.set("x-api-key", apiKey);
    }
  }

  #setHeaders(headers: Headers) {
    for (const [header, value] of this.defaultHeaders.entries()) {
      if (!headers.has(header)) {
        headers.set(header, value);
      }
    }
    if (this.apiKey) {
      this.#setApiKey(this.apiKey, headers);
    }
  }

  #setUrl(path: string) {
    if (["/logs", "/logs-stream"].includes(path)) {
      return new URL(`${this.baseUrl}${path}`);
    }
    return new URL(`${this.baseUrl}${this.basePath}${path}`);
  }

  flow(flowId: string, tweaks?: Tweaks): Flow {
    return new Flow(this, flowId, tweaks);
  }

  async request(options: RequestOptions): Promise<unknown> {
    const { path, method, query, body, headers, signal } = options;
    const url = this.#setUrl(path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.append(key, value);
      }
    }
    this.#setHeaders(headers);
    try {
      signal?.throwIfAborted();
      const response = await this.fetch(url, { method, body, headers, signal });
      if (!response.ok) {
        throw new LangflowError(
          `${response.status} - ${response.statusText}`,
          response
        );
      }
      signal?.throwIfAborted();
      return await response.json();
    } catch (error) {
      // If it is a LangflowError or the result of an aborted signal, rethrow it
      if (
        error instanceof LangflowError ||
        (error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "TimeoutError"))
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new LangflowRequestError(error.message, error);
      }
      throw error;
    }
  }

  async stream<T>(options: RequestOptions): Promise<ReadableStream<T>> {
    const { path, method, body, headers, signal } = options;
    const url = this.#setUrl(path);
    url.searchParams.set("stream", "true");
    this.#setHeaders(headers);
    try {
      signal?.throwIfAborted();
      const response = await this.fetch(url, {
        method,
        body,
        headers,
        signal,
      });
      if (!response.ok) {
        throw new LangflowError(
          `${response.status} - ${response.statusText}`,
          response
        );
      }
      if (response.body) {
        const ndjsonStream = NDJSONStream<T>();
        return response.body
          .pipeThrough(new TextDecoderStream(), { signal })
          .pipeThrough(ndjsonStream, { signal });
      } else {
        throw new LangflowError("No body in the response", response);
      }
    } catch (error) {
      if (
        error instanceof LangflowError ||
        (error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "TimeoutError"))
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new LangflowRequestError(error.message, error);
      }
      throw error;
    }
  }
}
