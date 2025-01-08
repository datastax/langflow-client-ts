import { LangflowError, LangflowRequestError } from "./errors.js";
import { Flow } from "./flow.js";
import type { LangflowClientOptions, Tweaks } from "./types.js";

export class LangflowClient {
  baseUrl: string;
  langflowId: string;
  apiKey: string;

  constructor(opts: LangflowClientOptions) {
    this.baseUrl = opts.baseUrl ?? "https://api.langflow.astra.datastax.com";
    this.langflowId = opts.langflowId;
    this.apiKey = opts.apiKey;
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
    const url = `${this.baseUrl}/lf/${this.langflowId}/api/v1${path}`;
    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }
    try {
      const response = await fetch(url, { method, body, headers });
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
