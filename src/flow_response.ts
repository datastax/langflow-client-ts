import { LangflowResponse } from "./types.js";

export class FlowResponse {
  sessionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputs: Array<{ inputs: any; outputs: Array<any> }>;

  constructor(response: LangflowResponse) {
    this.sessionId = response.session_id;
    this.outputs = response.outputs;
  }

  /**
   * Retrieves the first chat response message from the outputs.
   *
   * This is useful when you have one chat output from a flow. It is a shortcut
   * to return the text from the first chat output. If no chat output is found,
   * it returns undefined.
   *
   * @returns {string | undefined} The chat response message text if available, otherwise undefined.
   */
  chatOutputText(): string | undefined {
    for (const outputs of this.outputs) {
      if (Array.isArray(outputs.outputs)) {
        const chatOutput = outputs.outputs.find(
          (output) => !!output?.outputs?.message,
        );
        return chatOutput?.outputs?.message.message.text;
      }
    }
    return undefined;
  }
}
