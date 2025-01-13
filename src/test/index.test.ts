import { describe, it } from "node:test";
import * as assert from "node:assert";
import { LangflowClient } from "../index.js";
import { LangflowRequestError } from "../errors.js";
import { Flow } from "../flow.js";
import { DATASTAX_LANGFLOW_BASE_URL } from "../consts.js";
import { createMockFetch } from "./utils.js";

describe("LangflowClient", () => {
  describe("with a DataStax API URL", () => {
    const baseUrl = DATASTAX_LANGFLOW_BASE_URL;
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

    it("sets the basePath to use the langflowId", () => {
      const client = new LangflowClient({ baseUrl, langflowId, apiKey });
      assert.equal(client.basePath, `/lf/${langflowId}/api/v1`);
    });

    it("throws an error if initialized without a langflowId", () => {
      assert.throws(() => {
        new LangflowClient({ baseUrl, apiKey });
      }, TypeError);
    });

    it("throws an error if initialized without an apiKey", () => {
      assert.throws(() => {
        new LangflowClient({ baseUrl, langflowId });
      }, TypeError);
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
            assert.equal(
              input,
              `${baseUrl}/lf/${langflowId}/api/v1/run/flow-id`
            );
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

  describe("with a custom API URL", () => {
    const baseUrl = "http://localhost:1234";

    it("is initialized successfully with a custom URL", () => {
      const client = new LangflowClient({ baseUrl });
      assert.equal(client.baseUrl, baseUrl);
    });

    it("sets the basePath to the basic path", () => {
      const client = new LangflowClient({ baseUrl });
      assert.equal(client.basePath, `/api/v1`);
    });

    it("throws an error if langflowId is provided for a custom URL", () => {
      const langflowId = "my-langflow-id";
      assert.throws(() => {
        new LangflowClient({ baseUrl, langflowId });
      }, TypeError);
    });
  });
});
