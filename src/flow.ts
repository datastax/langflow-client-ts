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
    options: Partial<Omit<FlowRequestOptions, "input_value">> = {}
  ) {
    const {
      input_type = "chat",
      output_type = "chat",
      session_id,
      signal,
    } = options;
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
    const result = (await this.client.request({
      path: `/run/${this.id}`,
      method: "POST",
      body,
      headers,
      signal,
    })) as LangflowResponse;

    return new FlowResponse(result);
  }

  async stream(
    input_value: string,
    options: Partial<Omit<FlowRequestOptions, "input_value">> = {}
  ) {
    const {
      input_type = "chat",
      output_type = "chat",
      session_id,
      signal,
    } = options;
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
    const streamingResult = await this.client.stream({
      path: `/run/${this.id}`,
      method: "POST",
      body,
      headers,
      signal,
    });
    return streamingResult;
  }

  async uploadFile(path: string, options: { signal?: AbortSignal } = {}) {
    const data = await readFile(path);
    const { signal } = options;
    const type = mime.getType(extname(path));
    const file = new File([data], basename(path), type ? { type } : {});

    const form = new FormData();
    form.append("file", file);

    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = (await this.client.request({
      path: `/files/upload/${this.id}`,
      method: "POST",
      body: form,
      headers,
      signal,
    })) as LangflowUploadResponse;
    return new UploadResponse(response);
  }
}
