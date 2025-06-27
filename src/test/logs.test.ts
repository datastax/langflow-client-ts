import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { LangflowClient } from "../index.js";
import { createMockFetch } from "./utils.js";
import { LangflowRequestError } from "../errors.js";
import { Headers } from "undici";

const baseUrl = "http://localhost:3000";

describe("Logs", () => {
  describe("fetch", () => {
    it("fetches logs without options", async () => {
      const logData = {
        "2025-02-13T12:00:00.000Z": "First log message",
        "2025-02-13T12:01:00.000Z": "Second log message",
      };

      const fetcher = createMockFetch(logData, async (input, init) => {
        const url = new URL(input.toString());
        assert.equal(url.pathname, "/logs");
        assert.equal(init?.method, "GET");
        assert.equal(
          new Headers(init?.headers).get("Accept"),
          "application/json"
        );
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      const logs = await client.logs.fetch();
      assert.equal(logs.length, 2);
      assert.equal(logs[0].message, "First log message");
      assert.equal(logs[1].message, "Second log message");
      assert.ok(logs[0].timestamp instanceof Date);
      assert.ok(logs[1].timestamp instanceof Date);
    });

    it("fetches logs with timestamp option", async () => {
      const timestamp = Date.now();
      const fetcher = createMockFetch({}, async (input) => {
        const url = new URL(input.toString());
        assert.equal(url.searchParams.get("timestamp"), timestamp.toString());
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      await client.logs.fetch({ timestamp });
    });

    it("fetches logs with lines_before option", async () => {
      const fetcher = createMockFetch({}, async (input) => {
        const url = new URL(input.toString());
        assert.equal(url.searchParams.get("lines_before"), "10");
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      await client.logs.fetch({ lines_before: 10 });
    });

    it("fetches logs with lines_after option", async () => {
      const timestamp = Date.now();
      const fetcher = createMockFetch({}, async (input) => {
        const url = new URL(input.toString());
        assert.equal(url.searchParams.get("lines_after"), "5");
        assert.equal(url.searchParams.get("timestamp"), timestamp.toString());
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      await client.logs.fetch({ timestamp, lines_after: 5 });
    });
  });

  describe("stream", () => {
    it("streams logs", async () => {
      const logData = [
        { "2025-02-13T12:00:00.000Z": "First log message" },
        { "2025-02-13T12:01:00.000Z": "Second log message" },
      ];

      const fetcher = createMockFetch(
        logData,
        async (input, init) => {
          const url = new URL(input.toString());
          assert.equal(url.pathname, "/logs-stream");
          assert.equal(init?.method, "GET");
          assert.equal(
            new Headers(init?.headers).get("Accept"),
            "text/event-stream"
          );
        },
        {
          ok: true,
          body: ReadableStream.from(
            logData.map((d) => JSON.stringify(d))
          ).pipeThrough(new TextEncoderStream()),
        }
      );

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      const stream = await client.logs.stream();
      const logs = [];
      for await (const log of stream) {
        logs.push(log);
      }

      assert.equal(logs.length, 2);
      assert.equal(logs[0].message, "First log message");
      assert.equal(logs[1].message, "Second log message");
      assert.ok(logs[0].timestamp instanceof Date);
      assert.ok(logs[1].timestamp instanceof Date);
    });

    it("handles stream errors", async () => {
      const fetcher = createMockFetch({}, async () => {}, {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      try {
        await client.logs.stream();
        assert.fail("Expected an error to be thrown");
      } catch (error) {
        if (error instanceof Error) {
          assert.ok(error instanceof LangflowRequestError);
          assert.equal(error.message, "Internal Server Error");
        }
      }
    });

    it("handles stream abort", async () => {
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
        await client.logs.stream({ signal: ac.signal });
        assert.fail("Expected an error to be thrown");
      } catch (error) {
        assert.ok(error instanceof DOMException);
        assert.equal(error.name, "AbortError");
      }
    });
  });
});
