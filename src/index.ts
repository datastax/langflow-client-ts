import { LangflowError } from "./error.js";
import { Flow } from "./flow.js";
import type { LangflowClientOptions, LangflowRequestOptions } from "./types.js";

export class LangflowClient {
  baseUrl: string;
  langflowId?: string;
  apiKey?: string;

  constructor(opts: LangflowClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.langflowId = opts.langflowId;
    this.apiKey = opts.apiKey || process.env.LANGFLOW_API_KEY;
  }

  flow(flowId: string): Flow {
    return new Flow(this, flowId, {});
  }

  async request(
    flowId: string,
    body: LangflowRequestOptions
  ): Promise<unknown> {
    const url = `${this.baseUrl}/lf/${this.langflowId}/api/v1/run/${flowId}`;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
    if (!response.ok) {
      throw new LangflowError(
        `${response.status} - ${response.statusText}`,
        response
      );
    }
    const result = await response.json();
    return result;
  }
}
