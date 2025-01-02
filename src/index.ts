import { LangflowError } from "./error.js";
import { Flow } from "./flow.js";
import { FlowResponse } from "./flow_response.js";
import type {
  LangflowClientOptions,
  FlowRequestOptions,
  LangflowResponse,
  Tweaks,
} from "./types.js";

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
    flowId: string,
    body: FlowRequestOptions
  ): Promise<FlowResponse> {
    const url = `${this.baseUrl}/lf/${this.langflowId}/api/v1/run/${flowId}`;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
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
    const result = (await response.json()) as LangflowResponse;
    return new FlowResponse(result);
  }
}
