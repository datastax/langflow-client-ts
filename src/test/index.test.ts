import { describe, it } from "node:test";
import * as assert from "node:assert";
import { LangflowClient } from "../index.js";
import { Flow } from "../flow.js";

describe("LangflowClient", () => {
  const baseUrl = "https://api.langflow.astra.datastax.com";
  const apiKey = "my-api-key";
  const langflowId = "my-langflow-id";

  it("is initialized successfully with a langflowId and apiKey", () => {
    const client = new LangflowClient({ langflowId, apiKey });
    assert.equal(client.langflowId, langflowId);
    assert.equal(client.apiKey, apiKey);
  });

  it("is initialized successfully with a baseUrl, an apiKey, and a langflowId", () => {
    const client = new LangflowClient({ baseUrl, langflowId, apiKey });
    assert.equal(client.baseUrl, baseUrl);
  });

  describe("flow", () => {
    const client = new LangflowClient({ langflowId, apiKey });

    it("returns a new Flow instance", () => {
      const flowId = "flow-id";
      const flow = client.flow(flowId);
      assert.ok(flow instanceof Flow);
      assert.equal(flow.id, flowId);
    });

    it("returns a new Flow instance with tweaks", () => {
      const flowId = "flow-id";
      const tweaks = { key: "value" };
      const flow = client.flow(flowId, tweaks);
      assert.deepEqual(flow.tweaks, tweaks);
    });
  });
});
