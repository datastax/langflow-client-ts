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
          (output) => !!output?.outputs?.message
        );
        const message = chatOutput?.outputs?.message.message;
        if (typeof message === "string") {
          return message;
        } else {
          return message?.text;
        }
      }
    }
    return undefined;
  }
}
