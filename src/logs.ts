import { LangflowClient } from "./index.js";
import { Log } from "./log.js";

type LogFetchOptions =
  | {
      timestamp: number;
      lines_before?: never;
      lines_after?: never;
      signal?: AbortSignal;
    }
  | {
      timestamp: number;
      lines_after: number;
      lines_before?: never;
      signal?: AbortSignal;
    }
  | {
      timestamp?: number;
      lines_before: number;
      lines_after?: never;
      signal?: AbortSignal;
    };

export class Logs {
  client: LangflowClient;

  constructor(client: LangflowClient) {
    this.client = client;
  }

  async fetch(options?: LogFetchOptions) {
    const query: Record<string, string> = {};
    let signal;
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        query[key] = value.toString();
      });
      signal = options.signal;
    }
    const headers = new Headers();
    headers.set("Accept", "application/json");
    const response = (await this.client.request({
      path: "/logs",
      method: "GET",
      headers,
      query,
      signal,
    })) as Record<string, string>;
    return Object.entries(response)
      .map(([timestamp, message]) => new Log(timestamp, message))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async stream(options?: { signal?: AbortSignal }) {
    const signal = options?.signal;
    const headers = new Headers();
    headers.set("Accept", "text/event-stream");
    const streamingResponse = await this.client.stream<Record<string, string>>({
      path: "/logs-stream",
      headers,
      method: "GET",
      signal,
    });
    const streamToLog = new TransformStream<Record<string, string>, Log>({
      transform(chunk, controller) {
        Object.entries(chunk).forEach(([timestamp, message]) => {
          controller.enqueue(new Log(timestamp, message));
        });
      },
    });
    return streamingResponse.pipeThrough(streamToLog, { signal });
  }
}
