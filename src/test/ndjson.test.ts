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

import { NDJSONStream } from "../ndjson.js";

import { describe, it } from "node:test";
import * as assert from "node:assert";

describe("NDJSONStream", () => {
  async function collectStream(readable: ReadableStream) {
    const results = [];
    for await (const result of readable) {
      results.push(result);
    }
    return results;
  }

  it("transforms a single JSON object", async () => {
    const inputStream = ReadableStream.from([
      JSON.stringify({ test: "value" }),
    ]);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, [{ test: "value" }]);
  });

  it("transforms multiple JSON objects", async () => {
    const inputStream = ReadableStream.from([
      JSON.stringify({ test: "value1" }) +
        "\n" +
        JSON.stringify({ test: "value2" }),
    ]);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, [{ test: "value1" }, { test: "value2" }]);
  });

  it("handles partial JSON objects across chunks", async () => {
    const inputStream = ReadableStream.from(['{"test": "val', 'ue"}\n']);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, [{ test: "value" }]);
  });

  it("stops transforming on invalid input", async () => {
    const inputStream = ReadableStream.from([
      '{"valid": "json"}\ninvalid\n{"also": "valid"}\n',
    ]);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, [{ valid: "json" }]);
  });

  it("handles empty input", async () => {
    const inputStream = ReadableStream.from([]);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, []);
  });

  it("handles whitespace between objects", async () => {
    const inputStream = ReadableStream.from([
      '{"test": "value1"}\n\n\n{"test": "value2"}\n',
    ]);
    const transform = NDJSONStream();
    const readable = inputStream.pipeThrough(transform);

    const results = await collectStream(readable);
    assert.deepEqual(results, [{ test: "value1" }, { test: "value2" }]);
  });
});
