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

import { Headers } from "undici";

import { LangflowClient } from "../index.js";
import { LangflowRequestError, LangflowError } from "../errors.js";
import { Flow } from "../flow.js";
import { DATASTAX_LANGFLOW_BASE_URL } from "../consts.js";
import { createMockFetch } from "./utils.js";

import { describe, it } from "node:test";
import * as assert from "node:assert";

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
        const response = await client.request({
          path: "/run/flow-id",
          method: "POST",
          body: JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          headers: new Headers(),
        });
        assert.deepEqual(response, { session_id: "session-id", outputs: [] });
      });

      it("includes the API key in the Authorization header", async () => {
        const fetcher = createMockFetch(
          { session_id: "session-id", outputs: [] },
          (input, init) => {
            const headers = new Headers(init?.headers);
            assert.equal(headers.get("Authorization"), `Bearer ${apiKey}`);
          }
        );

        const client = new LangflowClient({
          baseUrl,
          langflowId,
          apiKey,
          fetch: fetcher,
        });
        await client.request({
          path: "/run/flow-id",
          method: "POST",
          body: JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          headers: new Headers(),
        });
      });

      it("includes a user agent in the headers", async () => {
        const fetcher = createMockFetch(
          { session_id: "session-id", outputs: [] },
          (input, init) => {
            const headers = new Headers(init?.headers);
            const userAgent = headers.get("User-Agent");
            assert.ok(userAgent);
            assert.match(
              userAgent,
              /^@datastax\/langflow-client\/\d+\.\d+\.\d+/
            );
          }
        );

        const client = new LangflowClient({
          baseUrl,
          langflowId,
          apiKey,
          fetch: fetcher,
        });
        await client.request({
          path: "/run/flow-id",
          method: "POST",
          body: JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          headers: new Headers(),
        });
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
          await client.request({
            path: "/run/flow-id",
            method: "POST",
            body: JSON.stringify({
              input_type: "chat",
              output_type: "chat",
              input_value: "Hello, world!",
            }),
            headers: new Headers(),
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof LangflowError);
          assert.equal(error.message, "401 - Unauthorized");
        }
      });

      it("throws a LangflowRequestError if the request fails", async () => {
        const fetcher = createMockFetch({ details: "blah" }, () => {}, {
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        });

        const client = new LangflowClient({
          baseUrl,
          langflowId,
          apiKey,
          fetch: fetcher,
        });

        try {
          await client.request({
            path: "/run/flow-id",
            method: "POST",
            body: JSON.stringify({
              input_type: "chat",
              output_type: "chat",
              input_value: "Hello, world!",
            }),
            headers: new Headers(),
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof LangflowRequestError);
          assert.equal(error.message, "Internal Server Error");
        }
      });

      it("throws a DOMException AbortError if the request is aborted", async () => {
        const fetcher = createMockFetch(
          { session_id: "session-id", outputs: [] },
          () => {
            assert.fail("Should not have made a request");
          }
        );

        const client = new LangflowClient({
          baseUrl,
          langflowId,
          apiKey,
          fetch: fetcher,
        });
        const ac = new AbortController();
        ac.abort();
        try {
          await client.request({
            path: "/run/flow-id",
            method: "POST",
            body: JSON.stringify({
              input_type: "chat",
              output_type: "chat",
              input_value: "Hello, world!",
            }),
            headers: new Headers(),
            signal: ac.signal,
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof DOMException);
          assert.equal(error.message, ac.signal.reason.message);
        }
      });
    });
  });

  describe("with a custom API URL", () => {
    const baseUrl = "http://localhost:1234";
    const apiKey = "my-api-key";

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

    describe("request", () => {
      it("makes a request to the baseURL with the full path to the method", async () => {
        const fetcher = createMockFetch(
          { session_id: "session-id", outputs: [] },
          (input, init) => {
            assert.equal(input, `${baseUrl}/api/v1/run/flow-id`);
            assert.equal(init?.method, "POST");
          }
        );

        const client = new LangflowClient({
          baseUrl,
          fetch: fetcher,
        });
        const response = await client.request({
          path: "/run/flow-id",
          method: "POST",
          body: JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          headers: new Headers(),
        });
        assert.deepEqual(response, { session_id: "session-id", outputs: [] });
      });

      it("includes the API key in the Authorization header", async () => {
        const fetcher = createMockFetch(
          { session_id: "session-id", outputs: [] },
          (input, init) => {
            const headers = new Headers(init?.headers);
            assert.equal(headers.get("x-api-key"), apiKey);
          }
        );

        const client = new LangflowClient({
          baseUrl,
          apiKey,
          fetch: fetcher,
        });
        await client.request({
          path: "/run/flow-id",
          method: "POST",
          body: JSON.stringify({
            input_type: "chat",
            output_type: "chat",
            input_value: "Hello, world!",
          }),
          headers: new Headers(),
        });
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
          fetch: fetcher,
        });

        try {
          await client.request({
            path: "/run/flow-id",
            method: "POST",
            body: JSON.stringify({
              input_type: "chat",
              output_type: "chat",
              input_value: "Hello, world!",
            }),
            headers: new Headers(),
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof LangflowError);
          assert.equal(error.message, "401 - Unauthorized");
        }
      });
    });

    describe("stream", () => {
      const exampleBody = JSON.stringify({
        input_type: "chat",
        output_type: "chat",
        input_value: "Hello, world!",
      });

      it("makes a streaming request with the stream parameter", async () => {
        const events = [
          { event: "add_message", data: {} },
          {
            event: "token",
            data: {
              id: "abc123",
              chunk: "Hello",
              timestamp: "2025-02-10 04:18:42 UTC",
            },
          },
          {
            event: "end",
            data: { result: { session_id: "def465", outputs: [] } },
          },
        ];
        const fetcher = createMockFetch(
          events,
          (input, init) => {
            const url = new URL(input);
            assert.equal(url.searchParams.get("stream"), "true");
            assert.equal(url.pathname, "/api/v1/run/flow-id");
            assert.equal(init?.method, "POST");
          },
          {
            ok: true,
            body: ReadableStream.from(
              events.map((e) => JSON.stringify(e))
            ).pipeThrough(new TextEncoderStream()),
          }
        );

        const client = new LangflowClient({
          baseUrl,
          fetch: fetcher,
        });

        const stream = await client.stream({
          path: "/run/flow-id",
          method: "POST",
          headers: new Headers(),
          body: exampleBody,
        });

        const receivedEvents = [];
        for await (const value of stream) {
          receivedEvents.push(value);
        }
        assert.deepEqual(receivedEvents, events);
      });

      it("includes the API key in x-api-key header for streams", async () => {
        const fetcher = createMockFetch(
          {},
          (input, init) => {
            const headers = new Headers(init?.headers);
            assert.equal(headers.get("x-api-key"), apiKey);
          },
          {
            ok: true,
            body: new ReadableStream({
              start(controller) {
                controller.close();
              },
            }),
          }
        );

        const client = new LangflowClient({
          baseUrl,
          apiKey,
          fetch: fetcher,
        });

        await client.stream({
          path: "/run/flow-id",
          method: "POST",
          headers: new Headers(),
          body: exampleBody,
        });
      });

      it("handles stream abort signal", async () => {
        const ac = new AbortController();
        ac.abort();

        const fetcher = createMockFetch({}, () => {
          assert.fail("Should not have made a request");
        });

        const client = new LangflowClient({
          baseUrl,
          fetch: fetcher,
        });

        try {
          await client.stream({
            path: "/run/flow-id",
            method: "POST",
            headers: new Headers(),
            body: exampleBody,
            signal: ac.signal,
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof DOMException);
          assert.equal(error.name, "AbortError");
        }
      });

      it("throws LangflowError if stream response has no body", async () => {
        const fetcher = createMockFetch({}, () => {}, {
          ok: true,
        });

        const client = new LangflowClient({
          baseUrl,
          fetch: fetcher,
        });

        try {
          await client.stream({
            path: "/run/flow-id",
            method: "POST",
            headers: new Headers(),
            body: exampleBody,
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof LangflowError);
          assert.equal(error.message, "No body in the response");
        }
      });

      it("throws LangflowError if stream response is not ok", async () => {
        const fetcher = createMockFetch({}, () => {}, {
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        });

        const client = new LangflowClient({
          baseUrl,
          fetch: fetcher,
        });

        try {
          await client.stream({
            path: "/run/flow-id",
            method: "POST",
            headers: new Headers(),
            body: exampleBody,
          });
          assert.fail("Expected an error to be thrown");
        } catch (error) {
          assert.ok(error instanceof LangflowError);
          assert.equal(error.message, "401 - Unauthorized");
        }
      });
    });
  });
});
