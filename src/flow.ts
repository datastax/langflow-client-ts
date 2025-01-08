import { LangflowClient } from "./index.js";
import { Tweaks, Tweak, FlowRequestOptions } from "./types.js";

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

  run(
    input_value: string,
    options: Partial<Omit<FlowRequestOptions, "input_value">>
  ) {
    const { input_type = "chat", output_type = "chat", session_id } = options;
    const tweaks = { ...this.tweaks, ...options.tweaks };
    return this.client.request(this.id, {
      input_type,
      output_type,
      input_value,
      tweaks,
      session_id,
    });
  }
}
