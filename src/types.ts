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

import { InputTypes, OutputTypes } from "./consts.js";

export interface LangflowClientOptions {
  baseUrl?: string;
  langflowId?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  defaultHeaders?: Headers;
}

export type FlowInputType = (typeof InputTypes)[keyof typeof InputTypes];
export type FlowOutputType = (typeof OutputTypes)[keyof typeof OutputTypes];

export interface FlowRequestOptions {
  input_type: FlowInputType;
  output_type: FlowOutputType;
  input_value: string;
  tweaks?: Tweaks;
  session_id?: string;
  signal?: AbortSignal;
}

export interface RequestOptions {
  path: string;
  method: string;
  body: string | FormData;
  headers: Headers;
  signal?: AbortSignal;
}

export type Tweak = Record<string, string | number | null | boolean>;

export type Tweaks = Record<string, Tweak | string>;

export interface LangflowResponse {
  session_id: string;
  outputs: Array<{ inputs: object; outputs: Array<object> }>;
}

export interface LangflowUploadResponse {
  flowId: string;
  file_path: string;
}

type TokenStreamEvent = {
  event: "token";
  data: {
    chunk: string;
    id: string;
    timestamp: string;
  };
};

type AddMessageStreamEvent = {
  event: "add_message";
  data: unknown;
};

type EndStreamEvent = {
  event: "end";
  data: {
    result: {
      session_id: string;
      outputs: Array<{ inputs: unknown; outputs: Array<unknown> }>;
    };
  };
};

export type StreamEvent =
  | TokenStreamEvent
  | AddMessageStreamEvent
  | EndStreamEvent;
