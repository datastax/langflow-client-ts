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

import { fetch, FormData } from "undici";

import pkg from "../package.json" with { type: "json" };
import { LangflowError, LangflowRequestError } from "./errors.js";
import { Flow } from "./flow.js";
import type { LangflowClientOptions, Tweaks } from "./types.js";
import { DATASTAX_LANGFLOW_BASE_URL } from "./consts.js";

import { platform, arch } from "os";

export class LangflowClient {
  baseUrl: string;
  basePath: string;
  langflowId?: string;
  apiKey?: string;
  fetch: typeof fetch;
  defaultHeaders: Headers;

  constructor(opts: LangflowClientOptions) {
    this.baseUrl = opts.baseUrl ?? DATASTAX_LANGFLOW_BASE_URL;
    this.basePath = "/api/v1";
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
      this.basePath = `/lf/${this.langflowId}/api/v1`;
    }
    if (!this.#isDataStax() && this.langflowId) {
      throw new TypeError("langflowId is not supported");
    }
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

  flow(flowId: string, tweaks?: Tweaks): Flow {
    return new Flow(this, flowId, tweaks);
  }

  async request(
    path: string,
    method: string,
    body: string | FormData,
    headers: Headers,
    query?: Record<string, string>
  ): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${this.basePath}${path}`);
    for (const [header, value] of this.defaultHeaders.entries()) {
      if (!headers.has(header)) {
        headers.set(header, value);
      }
    }
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    if (this.apiKey) {
      this.#setApiKey(this.apiKey, headers);
    }
    try {
      const response = await this.fetch(url, { method, body, headers });
      if (!response.ok) {
        throw new LangflowError(
          `${response.status} - ${response.statusText}`,
          response
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof LangflowError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new LangflowRequestError(error.message, error);
      }
      throw error;
    }
  }
}
