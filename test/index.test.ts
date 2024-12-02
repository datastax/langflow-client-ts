import { describe, it, afterEach } from "node:test";
import * as assert from "node:assert";
import { LangflowClient } from "../src/index.js";

describe("LangflowClient", () => {
  const baseUrl = "https://api.langflow.astra.datastax.com";
  const apiKey = "my-api-key";
  const langflowId = "my-langflow-id";

  afterEach(() => {
    delete process.env.LANGFLOW_API_KEY;
  });

  it("is initialized successfully with a baseUrl", () => {
    const client = new LangflowClient({ baseUrl });
    assert.equal(client.baseUrl, baseUrl);
  });

  it("is initialized successfully with a baseUrl and an apiKey", () => {
    const client = new LangflowClient({ baseUrl, apiKey });
    assert.equal(client.apiKey, apiKey);
  });

  it("is initialized successfully with a baseUrl and a langflowId", () => {
    const client = new LangflowClient({ baseUrl, langflowId });
    assert.equal(client.langflowId, langflowId);
  });

  it("is initialized successfully with a baseUrl, an apiKey, and a langflowId", () => {
    const client = new LangflowClient({ baseUrl, langflowId, apiKey });
    assert.equal(client.langflowId, langflowId);
    assert.equal(client.apiKey, apiKey);
  });

  it("initializes successfully with an apiKey in the environment", () => {
    process.env.LANGFLOW_API_KEY = apiKey;
    const client = new LangflowClient({ baseUrl });
    assert.equal(client.apiKey, apiKey);
  });
});
