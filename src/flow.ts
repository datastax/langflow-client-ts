import mime from "mime";
import { FormData } from "undici";

import { LangflowClient } from "./index.js";
import { FlowResponse } from "./flow_response.js";
import { UploadResponse } from "./upload_response.js";
import {
  Tweaks,
  Tweak,
  FlowRequestOptions,
  LangflowResponse,
  LangflowUploadResponse,
} from "./types.js";

import { readFile } from "node:fs/promises";
import { extname, basename } from "node:path";

export class Flow {
  client: LangflowClient;
  id: string;
  tweaks: Tweaks;

  constructor(client: LangflowClient, flowId: string, tweaks: Tweaks = {}) {
    this.client = client;
    this.id = flowId;
    this.tweaks = tweaks;
  }

  tweak(key: string, tweak: Tweak) {
    const newTweaks = structuredClone(this.tweaks);
    newTweaks[key] = tweak;
    return new Flow(this.client, this.id, newTweaks);
  }

  async run(
    input_value: string,
    options: Partial<Omit<FlowRequestOptions, "input_value">>
  ) {
    const { input_type = "chat", output_type = "chat", session_id } = options;
    const tweaks = { ...this.tweaks, ...options.tweaks };
    const body = JSON.stringify({
      input_type,
      output_type,
      input_value,
      tweaks,
      session_id,
    });
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    const result = (await this.client.request(
      `/run/${this.id}`,
      "POST",
      body,
      headers
    )) as LangflowResponse;

    return new FlowResponse(result);
  }

  async uploadFile(path: string) {
    const data = await readFile(path);
    const type = mime.getType(extname(path));
    const file = new File([data], basename(path), type ? { type } : {});

    const form = new FormData();
    form.append("file", file);

    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = (await this.client.request(
      `/files/upload/${this.id}`,
      "POST",
      form,
      headers
    )) as LangflowUploadResponse;
    return new UploadResponse(response);
  }
}
