import { FormData } from "undici";

import { LangflowClient } from "../index.js";
import { Flow } from "../flow.js";
import { createMockFetch } from "./utils.js";
import { FlowResponse } from "../flow_response.js";
import { UploadResponse } from "../upload_response.js";

import { describe, it } from "node:test";
import * as assert from "node:assert";
import { join } from "node:path";

describe("Flow", () => {
  const baseUrl = "http://localhost:7860";
  const flowId = "flow-id";
  const client = new LangflowClient({ baseUrl });

  it("is initialized with a client and a flow ID", () => {
    const flow = new Flow(client, flowId);
    assert.equal(flow.client, client);
    assert.equal(flow.id, flowId);
  });

  it("is initialized with a client, a flow ID, and tweaks", () => {
    const tweaks = { key: "value" };
    const flow = new Flow(client, flowId, tweaks);
    assert.equal(flow.client, client);
    assert.equal(flow.id, flowId);
    assert.deepEqual(flow.tweaks, tweaks);
  });

  describe("tweak", () => {
    const flow = new Flow(client, "flow-id");

    it("returns a new Flow with the tweaks", () => {
      const tweak = { key: "value" };
      const newFlow = flow.tweak("key", tweak);
      assert.deepEqual(newFlow.tweaks, { key: tweak });
      assert.notEqual(newFlow, flow);
    });
  });

  describe("run", () => {
    it("sends a request to the server at the run endpoint", async () => {
      const fetcher = createMockFetch(
        { session_id: "session-id", outputs: [] },
        (input, init) => {
          assert.equal(input, `${baseUrl}/api/v1/run/flow-id`);
          assert.equal(init?.method, "POST");
        }
      );
      const client = new LangflowClient({
        baseUrl: "http://localhost:7860",
        fetch: fetcher,
      });
      const flow = new Flow(client, "flow-id");

      const result = await flow.run("Hello", {
        input_type: "chat",
        output_type: "chat",
      });

      assert.ok(result instanceof FlowResponse);
    });
  });

  describe("uploadFile", () => {
    it("reads the file and sends it to the server", async () => {
      const fetcher = createMockFetch(
        { session_id: "session-id", outputs: [] },
        (input, init) => {
          assert.equal(input, `${baseUrl}/api/v1/files/upload/${flowId}`);
          assert.equal(init?.method, "POST");
          assert.ok(init?.body instanceof FormData);
          assert.ok(init?.body.has("file"));
        }
      );
      const client = new LangflowClient({
        baseUrl: "http://localhost:7860",
        fetch: fetcher,
      });
      const flow = new Flow(client, flowId);

      const result = await flow.uploadFile(
        join(import.meta.dirname, "fixtures", "bodi.jpg")
      );
      assert.ok(result instanceof UploadResponse);
    });
  });
});
