export interface LangflowClientOptions {
  baseUrl: string;
  langflowId?: string;
  apiKey?: string;
}

export interface LangflowRequestOptions {
  input_type: "chat" | "text";
  output_type: "chat" | "text";
  input_value: string;
  tweaks: Tweaks;
}

export type Tweak = Record<string, string | number | null | boolean>;

export type Tweaks = Record<string, Tweak>;

export interface LangflowResponse {
  session_id: string;
  outputs: Array<{ inputs: object; outputs: Array<object> }>;
}
