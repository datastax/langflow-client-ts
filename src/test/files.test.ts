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

import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LangflowClient } from "../index.js";
import { createMockFetch, assertBlobEqual } from "./utils.js";
import { Headers } from "undici";
import { UserFile } from "../user_file.js";

const baseUrl = "http://localhost:3000";

describe("Files API v2", () => {
  const uploadResponse = {
    id: "b8fdff49-024e-48e2-acdd-7cd1e4d32d46",
    name: "bodi",
    path: "579f0128-52e1-4cf7-b5d4-5091d2697f1e/b8fdff49-024e-48e2-acdd-7cd1e4d32d46.jpg",
    size: 29601,
    provider: undefined,
  };

  const listUserFile = {
    ...uploadResponse,
    created_at: "2025-06-11T07:34:43.603Z",
    updated_at: "2025-06-11T07:34:43.603Z",
    user_id: "user_id1234",
  };

  describe("upload", async () => {
    const buffer = await readFile(
      new URL("fixtures/bodi.jpg", import.meta.url)
    );

    it("uploads a File object successfully", async () => {
      const file = new File([buffer], "bodi.jpg");

      const fetcher = createMockFetch(uploadResponse, async (input, init) => {
        const url = new URL(input.toString());
        assert.equal(url.pathname, "/api/v2/files");
        assert.equal(init?.method, "POST");
        const body = init?.body as FormData;
        assert.equal(body.get("file"), file);
        assert.equal(
          new Headers(init?.headers).get("Accept"),
          "application/json"
        );
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      const userUpload = await client.files.upload(file);
      assert.equal(userUpload.id, uploadResponse.id);
      assert.ok(userUpload instanceof UserFile);
    });

    it("uploads a Blob object successfully", async () => {
      const blob = new Blob([buffer]);

      const fetcher = createMockFetch(uploadResponse, async (input, init) => {
        const url = new URL(input.toString());
        assert.equal(url.pathname, "/api/v2/files");
        assert.equal(init?.method, "POST");
        const body = init?.body as FormData;
        const uploadedFile = body.get("file") as File;
        await assertBlobEqual(uploadedFile, blob);
        assert.equal(
          new Headers(init?.headers).get("Accept"),
          "application/json"
        );
      });

      const client = new LangflowClient({
        baseUrl,
        fetch: fetcher,
      });

      const userUpload = await client.files.upload(blob);
      assert.equal(userUpload.id, uploadResponse.id);
      assert.ok(userUpload instanceof UserFile);
    });
  });

  describe("list", async () => {
    const fetcher = createMockFetch([listUserFile], async (input, init) => {
      const url = new URL(input.toString());
      assert.equal(url.pathname, "/api/v2/files");
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

    const listOfFiles = await client.files.list();
    assert.deepEqual(listOfFiles, [new UserFile(listUserFile)]);
  });
});
