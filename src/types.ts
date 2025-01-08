import { InputTypes, OutputTypes } from "./flow_types.js";

export interface LangflowClientOptions {
  baseUrl?: string;
  langflowId: string;
  apiKey: string;
}

export type FlowInputType = (typeof InputTypes)[keyof typeof InputTypes];
export type FlowOutputType = (typeof OutputTypes)[keyof typeof OutputTypes];

export interface FlowRequestOptions {
  input_type: FlowInputType;
  output_type: FlowOutputType;
  input_value: string;
  tweaks?: Tweaks;
  session_id?: string;
}

export type Tweak = Record<string, string | number | null | boolean>;

export type Tweaks = Record<string, Tweak>;

export interface LangflowResponse {
  session_id: string;
  outputs: Array<{ inputs: object; outputs: Array<object> }>;
}

export interface LangflowUploadResponse {
  flowId: string;
  file_path: string;
}
