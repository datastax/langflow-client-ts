import { describe, it } from "node:test";
import * as assert from "node:assert";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { FlowResponse } from "../flow_response.js";

const agentResponse = join(
  import.meta.dirname,
  "fixtures",
  "agent_response.json"
);
const modelResponse = join(
  import.meta.dirname,
  "fixtures",
  "model_response.json"
);

const agentResponseText =
  "Hi again! How can I help you today? If you have any questions or topics you'd like to discuss, just let me know!";
const modelResponseText =
  "Hello! 🌟 I'm excited to help you get started on your journey! What fresh idea or project do you have in mind? Whether it's building something with AI, exploring a new technology, or diving into a creative endeavor, I'm here to assist you every step of the way!";

describe("FlowResponse", () => {
  describe("an agent response", () => {
    it("is initialized with a response", async () => {
      const response = JSON.parse(await readFile(agentResponse, "utf-8"));
      const flowResponse = new FlowResponse(response);
      assert.equal(flowResponse.sessionId, response.session_id);
      assert.deepEqual(flowResponse.outputs, response.outputs);
    });

    it("returns the first chat output text for ", async () => {
      const response = JSON.parse(await readFile(agentResponse, "utf-8"));
      const flowResponse = new FlowResponse(response);
      assert.equal(flowResponse.chatOutputText(), agentResponseText);
    });
  });

  describe("an model response", () => {
    it("is initialized with a response", async () => {
      const response = JSON.parse(await readFile(modelResponse, "utf-8"));
      const flowResponse = new FlowResponse(response);
      assert.equal(flowResponse.sessionId, response.session_id);
      assert.deepEqual(flowResponse.outputs, response.outputs);
    });

    it("returns the first chat output text for ", async () => {
      const response = JSON.parse(await readFile(modelResponse, "utf-8"));
      const flowResponse = new FlowResponse(response);
      assert.equal(flowResponse.chatOutputText(), modelResponseText);
    });
  });
});
