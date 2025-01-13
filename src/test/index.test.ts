import { describe, it } from "node:test";
import * as assert from "node:assert";
import { LangflowClient } from "../index.js";
import { LangflowRequestError } from "../errors.js";
import { Flow } from "../flow.js";
import { createMockFetch } from "./utils.js";

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

  describe("request", () => {
    it("makes a request to the baseURL with the full path to the method", async () => {
      const fetcher = createMockFetch(
        { session_id: "session-id", outputs: [] },
        (input, init) => {
          assert.equal(input, `${baseUrl}/lf/${langflowId}/api/v1/run/flow-id`);
          assert.equal(init?.method, "POST");
        }
      );

      const client = new LangflowClient({
        baseUrl,
        langflowId,
        apiKey,
        fetch: fetcher,
      });
      await client.request(
        "/run/flow-id",
        "POST",
        JSON.stringify({
          input_type: "chat",
          output_type: "chat",
          input_value: "Hello, world!",
        }),
        new Headers()
      );
    });

    it("throws a LangflowError if the response is not ok", async () => {
      const response = { details: "blah" };
      const fetcher = createMockFetch(response, () => {}, {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const client = new LangflowClient({
        baseUrl,
        langflowId,
        apiKey,
        fetch: fetcher,
      });

      try {
        await client.request(
          "/run/flow-id",
          "POST",
          JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          new Headers()
        );
        assert.fail("Expected an error to be thrown");
      } catch (error) {
        assert.ok(error instanceof LangflowRequestError);
        assert.equal(error.message, "401 - Unauthorized");
      }
    });
  });
});
