import { LangflowClient } from "./index.js";
import { Tweaks, Tweak } from "./types.js";

export class Flow {
  client: LangflowClient;
  flowId: string;
  tweaks: Tweaks;

  constructor(client: LangflowClient, flowId: string, tweaks: Tweaks = {}) {
    this.client = client;
    this.flowId = flowId;
    this.tweaks = tweaks;
  }

  tweak(key: string, tweak: Tweak) {
    const newTweaks = structuredClone(this.tweaks);
    newTweaks[key] = tweak;
    return new Flow(this.client, this.flowId, newTweaks);
  }

  run(input: string): Promise<unknown> {
    return this.client.request(this.flowId, {
      input_type: "chat",
      output_type: "chat",
      input_value: input,
      tweaks: this.tweaks,
    });
  }
}
