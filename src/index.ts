import { LangflowError, LangflowRequestError } from "./errors.js";
import { Flow } from "./flow.js";
import type { LangflowClientOptions, Tweaks } from "./types.js";
import { DATASTAX_LANGFLOW_BASE_URL } from "./consts.js";

export class LangflowClient {
  baseUrl: string;
  basePath: string;
  langflowId?: string;
  apiKey?: string;
  fetch: typeof fetch;

  constructor(opts: LangflowClientOptions) {
    this.baseUrl = opts.baseUrl ?? DATASTAX_LANGFLOW_BASE_URL;
    this.basePath = "/api/v1";
    this.langflowId = opts.langflowId;
    this.apiKey = opts.apiKey;
    this.fetch = opts.fetch ?? fetch;

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

  flow(flowId: string, tweaks?: Tweaks): Flow {
    return new Flow(this, flowId, tweaks);
  }

  async request(
    path: string,
    method: string,
    body: string | FormData,
    headers: Headers
  ): Promise<unknown> {
    const url = `${this.baseUrl}${this.basePath}${path}`;
    if (this.apiKey) {
      if (this.#isDataStax()) {
        headers.set("Authorization", `Bearer ${this.apiKey}`);
      } else {
        headers.set("x-api-key", this.apiKey);
      }
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
      if (error instanceof Error) {
        throw new LangflowRequestError(error.message, error);
      }
      throw error;
    }
  }
}
