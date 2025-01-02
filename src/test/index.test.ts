import { describe, it, afterEach } from "node:test";
import * as assert from "node:assert";
import { LangflowClient } from "../index.js";

describe("LangflowClient", () => {
  const baseUrl = "https://api.langflow.astra.datastax.com";
  const apiKey = "my-api-key";
  const langflowId = "my-langflow-id";

  afterEach(() => {
    delete process.env.LANGFLOW_API_KEY;
  });

  it("is initialized successfully with a langflowId and apiKey", () => {
    const client = new LangflowClient({ langflowId, apiKey });
    assert.equal(client.langflowId, langflowId);
    assert.equal(client.apiKey, apiKey);
  });

  it("is initialized successfully with a baseUrl, an apiKey, and a langflowId", () => {
    const client = new LangflowClient({ baseUrl, langflowId, apiKey });
    assert.equal(client.baseUrl, baseUrl);
  });
});
